const { Category, Shop } = require('../models');

const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

exports.index = async (req, res) => {
    try {
        const where = {};
        // If not admin, only show approved
        if (!req.user || !['super_admin', 'shop_admin'].includes(req.user.role)) {
            where.is_approved = true;
        }
        const categories = await Category.findAll({ where });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.store = async (req, res) => {
    try {
        const { name } = req.body;
        let imagePath = null;

        if (req.file) {
            const filename = req.file.filename;
            imagePath = `${process.env.APP_URL || 'http://localhost:8000'}/storage/categories/${filename}`;
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

        const category = await Category.create({
            name,
            slug: slugify(name, { lower: true }),
            image: imagePath,
            is_approved: isApproved,
            franchise_id: franchiseId
        });

        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create category', error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const { name } = req.body;

        if (req.file) {
            const filename = req.file.filename;
            category.image = `${process.env.APP_URL || 'http://localhost:8000'}/storage/categories/${filename}`;
        }

        await category.update({
            name,
            slug: slugify(name, { lower: true })
        });

        res.json(category);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update category', error: err.message });
    }
};

exports.approve = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        await category.update({ is_approved: true });
        res.json({ success: true, message: 'Category approved', category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.destroy = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Not found' });
        await category.destroy();
        res.status(204).json(null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
