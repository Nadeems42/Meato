const { Shop, ShopProduct, Product, User } = require('../models');
const sequelize = require('../config/database');

exports.index = async (req, res) => {
    try {
        const shops = await Shop.findAll({
            include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
        });
        res.json(shops);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.show = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id, {
            include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
        });
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        res.json(shop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.store = async (req, res) => {
    try {
        const shop = await Shop.create(req.body);

        // Auto-link all existing master products to this new shop
        const products = await Product.findAll();
        const shopProducts = products.map(p => ({
            franchise_id: shop.id,
            product_id: p.id,
            is_enabled: true,
            stock: 0,
            price_override: null
        }));

        await ShopProduct.bulkCreate(shopProducts);

        res.status(201).json(shop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Not found' });
        await shop.update(req.body);
        res.json(shop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.destroy = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Not found' });
        await shop.destroy();
        res.status(204).json(null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Find nearest shop based on lat/lng
exports.findNearest = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and Longitude required' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        const shops = await Shop.findAll({ where: { is_active: true } });

        let nearest = null;
        let minDistance = Infinity;

        for (const s of shops) {
            const R = 6371; // km
            const dLat = (s.lat - userLat) * Math.PI / 180;
            const dLon = (s.lng - userLng) * Math.PI / 180;
            const a =
                0.5 - Math.cos(dLat) / 2 +
                Math.cos(s.lat * Math.PI / 180) * Math.cos(userLat * Math.PI / 180) *
                (1 - Math.cos(dLon)) / 2;

            const d = R * 2 * Math.asin(Math.sqrt(a));

            // Check if within delivery radius
            if (d <= s.delivery_radius_km && d < minDistance) {
                minDistance = d;
                nearest = s;
            }
        }

        if (nearest) {
            res.json({
                found: true,
                shop: nearest,
                distance_km: minDistance
            });
        } else {
            // No shop found within radius
            res.json({
                found: false,
                message: 'No service available in your area.'
            });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Inventory Management ---

// Get all products for a shop (Administrative view - seeing enabling status etc)
exports.getInventory = async (req, res) => {
    try {
        const { id } = req.params; // Shop ID

        if (req.user.role === 'shop_admin') {
            const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
            if (!shop || shop.id != id) {
                return res.status(403).json({ error: 'Unauthorized to view this shop inventory' });
            }
        }

        const inventory = await ShopProduct.findAll({
            where: { franchise_id: id },
            include: [{ model: Product }]
        });
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update stock/price/status for a specific product in a shop
exports.updateInventoryItem = async (req, res) => {
    const { franchiseId, productId } = req.params;
    try {
        if (req.user.role === 'shop_admin') {
            const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
            if (!shop || shop.id != franchiseId) {
                return res.status(403).json({ error: 'Unauthorized to manage this shop inventory' });
            }
        }
        const item = await ShopProduct.findOne({
            where: { franchise_id: franchiseId, product_id: productId }
        });

        if (!item) {
            // Should exist if store flow works, but create if missing
            const newItem = await ShopProduct.create({
                franchise_id: franchiseId,
                product_id: productId,
                ...req.body
            });
            return res.status(201).json(newItem);
        }

        await item.update(req.body);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
