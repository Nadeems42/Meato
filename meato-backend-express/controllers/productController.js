const { Product, ProductVariant, Category, ShopProduct, Shop } = require('../models');
const sequelize = require('../config/database');

exports.index = async (req, res) => {
    try {
        const franchise_id = req.query.shop_id || req.query.franchise_id;

        const where = {};
        if (!req.user || !['super_admin', 'shop_admin'].includes(req.user.role)) {
            where.is_approved = true;
        }

        const products = await Product.findAll({
            where,
            include: [
                { model: Category, as: 'category' },
                { model: ProductVariant, as: 'variants' },
                // If franchise_id provided, include that specific shop data
                ...(franchise_id ? [{
                    model: ShopProduct,
                    as: 'shopProducts',
                    where: { franchise_id, is_enabled: true },
                    required: true // Only return products enabled for this shop
                }] : [])
            ],
            order: [['createdAt', 'DESC']]
        });

        // Transform response if shop specific
        if (franchise_id) {
            const transformed = products.map(p => {
                const item = p.shopProducts && p.shopProducts.length > 0 ? p.shopProducts[0] : null;

                // Fallback check if Sequelize returns it as FranchiseProducts due to lingering DB metadata? No, it's code based.
                // But wait, the tableName is still 'franchise_products'.
                // If I use the model ShopProduct, sequelize uses the model name for association naming unless alias is provided.

                const json = p.toJSON();

                if (item) {
                    // Override price if set
                    if (item.price_override) {
                        json.price = parseFloat(item.price_override);
                    }
                    // Override stock
                    json.stock = item.stock;
                }
                return json;
            });
            return res.json(transformed);
        }

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.show = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'category' },
                { model: ProductVariant, as: 'variants' }
            ]
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.store = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { category_id, name, description, price, stock, variants, gst_percentage } = req.body;
        let imagePath = null;

        if (req.file) {
            const filename = req.file.filename;
            imagePath = `${process.env.APP_URL || 'http://localhost:8000'}/storage/products/${filename}`;
        }

        const { role, id: userId } = req.user;
        let franchiseId = null;
        let isApproved = false;

        if (role === 'shop_admin') {
            const shop = await Shop.findOne({ where: { owner_id: userId } });
            if (shop) franchiseId = shop.id;
        } else if (role === 'super_admin') {
            isApproved = true;
        }

        const product = await Product.create({
            category_id,
            name,
            description,
            mrp: req.body.mrp || 0,
            price, // This is duplicate of Discounted Price
            stock,
            image: imagePath,
            gst_percentage: gst_percentage || 0,
            is_approved: isApproved,
            franchise_id: franchiseId
        }, { transaction: t });

        if (variants) {
            let parsedVariants = variants;
            if (typeof variants === 'string') {
                try {
                    parsedVariants = JSON.parse(variants);
                } catch (e) { }
            }

            if (Array.isArray(parsedVariants)) {
                for (const v of parsedVariants) {
                    await ProductVariant.create({
                        product_id: product.id,
                        variant_name: v.name,
                        price: v.price,
                        discount_price: v.discount_price,
                        stock_qty: v.stock
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        const newProduct = await Product.findByPk(product.id, { include: ['variants'] });
        res.status(201).json(newProduct);
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: 'Failed to create product', error: err.message });
    }
};

exports.update = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { category_id, name, description, price, stock, variants, gst_percentage } = req.body;

        if (req.file) {
            const filename = req.file.filename;
            product.image = `${process.env.APP_URL || 'http://localhost:8000'}/storage/products/${filename}`;
        }

        await product.update({
            category_id,
            name,
            description,
            mrp: req.body.mrp || product.mrp,
            price,
            stock,
            gst_percentage: gst_percentage || 0
        }, { transaction: t });

        if (variants) {
            let parsedVariants = variants;
            if (typeof variants === 'string') {
                try { parsedVariants = JSON.parse(variants); } catch (e) { }
            }
            if (Array.isArray(parsedVariants)) {
                await ProductVariant.destroy({ where: { product_id: product.id }, transaction: t });
                for (const v of parsedVariants) {
                    await ProductVariant.create({
                        product_id: product.id,
                        variant_name: v.name,
                        price: v.price,
                        discount_price: v.discount_price,
                        stock_qty: v.stock
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        res.json(await product.reload({ include: ['variants'] }));

    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: 'Failed to update', error: err.message });
    }
};

exports.approve = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.update({ is_approved: true });
        res.json({ success: true, message: 'Product approved', product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.destroy = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Not found' });
        await product.destroy();
        res.status(204).json(null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
