const { DeliveryZone, Shop } = require('../models');

// Get all delivery zones (public)
exports.index = async (req, res) => {
    try {
        const zones = await DeliveryZone.findAll({
            where: { active: true, is_approved: true },
            order: [['name', 'ASC']]
        });
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all zones for admin
exports.adminIndex = async (req, res) => {
    try {
        const zones = await DeliveryZone.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check if a pincode is in a delivery zone
exports.checkPincode = async (req, res) => {
    try {
        const { pincode } = req.body;

        if (!pincode) {
            return res.status(400).json({ error: 'Pincode is required' });
        }

        const zone = await DeliveryZone.findOne({
            where: {
                pincode: pincode.toString().trim(),
                active: true,
                is_approved: true
            }
        });

        if (!zone) {
            return res.json({
                available: true,
                fast_delivery: false,
                message: 'Standard delivery available'
            });
        }

        res.json({
            available: true,
            fast_delivery: zone.fast_delivery,
            zone_name: zone.name,
            message: zone.fast_delivery
                ? '⚡ 10-Minute Fast Delivery Available!'
                : 'Standard delivery available'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create new delivery zone (admin)
exports.store = async (req, res) => {
    try {
        const { name, pincode, radius_km, fast_delivery, active } = req.body;
        const { role, id: userId } = req.user;

        if (!name || !pincode) {
            return res.status(400).json({ error: 'Name and pincode are required' });
        }

        // Check if pincode already exists
        const existing = await DeliveryZone.findOne({ where: { pincode } });
        if (existing) {
            return res.status(400).json({ error: 'Pincode already exists in delivery zones' });
        }

        let franchiseId = null;
        let isApproved = false;

        if (role === 'shop_admin') {
            const shop = await Shop.findOne({ where: { owner_id: userId } });
            if (!shop) return res.status(403).json({ error: 'No shop found for this admin' });
            franchiseId = shop.id;
        } else if (role === 'super_admin') {
            franchiseId = req.body.shop_id || req.body.franchise_id || null;
            isApproved = true; // Super admin creations are auto-approved
        }

        const zone = await DeliveryZone.create({
            name,
            pincode,
            radius_km: radius_km || 5,
            fast_delivery: fast_delivery || false,
            active: active !== undefined ? active : true,
            franchise_id: franchiseId,
            is_approved: isApproved
        });

        res.status(201).json(zone);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approveZone = async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ error: 'Only Super Admin can approve zones' });
        }
        const { id } = req.params;
        const zone = await DeliveryZone.findByPk(id);
        if (!zone) return res.status(404).json({ error: 'Zone not found' });

        await zone.update({ is_approved: true });
        res.json({ success: true, message: 'Zone approved', zone });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update delivery zone (admin)
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, pincode, radius_km, fast_delivery, active, shop_id, franchise_id } = req.body;
        const finalShopId = shop_id || franchise_id;

        const zone = await DeliveryZone.findByPk(id);
        if (!zone) {
            return res.status(404).json({ error: 'Delivery zone not found' });
        }

        // If updating pincode, check uniqueness
        if (pincode && pincode !== zone.pincode) {
            const existing = await DeliveryZone.findOne({
                where: {
                    pincode,
                    id: { [require('sequelize').Op.ne]: id }
                }
            });
            if (existing) {
                return res.status(400).json({ error: 'Pincode already exists' });
            }
        }

        await zone.update({
            name: name || zone.name,
            pincode: pincode || zone.pincode,
            radius_km: radius_km !== undefined ? radius_km : zone.radius_km,
            fast_delivery: fast_delivery !== undefined ? fast_delivery : zone.fast_delivery,
            active: active !== undefined ? active : zone.active,
            is_approved: req.user.role === 'super_admin' ? (req.body.is_approved !== undefined ? req.body.is_approved : zone.is_approved) : zone.is_approved
        });

        res.json(zone);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete delivery zone (admin)
// Get zones for the logged-in Shop Admin
exports.shopIndex = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const shop = await Shop.findOne({ where: { owner_id: userId } });
        if (!shop) return res.status(403).json({ error: 'You do not own a shop' });

        const zones = await DeliveryZone.findAll({
            where: { franchise_id: shop.id },
            order: [['created_at', 'DESC']]
        });
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete delivery zone (admin)
exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const zone = await DeliveryZone.findByPk(id);
        if (!zone) {
            return res.status(404).json({ error: 'Delivery zone not found' });
        }

        // Ownership check for shop_admin
        if (req.user.role === 'shop_admin') {
            const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
            if (!shop || zone.franchise_id !== shop.id) {
                return res.status(403).json({ error: 'Unauthorized to delete this zone' });
            }
        }

        await zone.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
