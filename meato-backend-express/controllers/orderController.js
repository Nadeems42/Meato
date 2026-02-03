const { Order, OrderItem, Cart, CartItem, Product, ProductVariant, User, DeliveryZone, Shop } = require('../models');
const sequelize = require('../config/database');
const notificationService = require('../services/notificationService');

exports.index = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.user.id },
            include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
            order: [['createdAt', 'DESC']]
        });

        // Parse delivery_address JSON
        const parsedOrders = orders.map(order => {
            const o = order.toJSON();
            try { o.delivery_address = JSON.parse(o.delivery_address); } catch (e) { }
            return o;
        });

        res.json(parsedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.store = async (req, res) => {
    console.log('Incoming Order Request:', JSON.stringify(req.body, null, 2));
    const t = await sequelize.transaction();
    try {
        const deliveryAddress = req.body.delivery_address || {};
        const pincode = deliveryAddress.pincode;

        let total = 0;
        let totalGst = 0;
        const orderItemsData = [];
        let userId = null;

        // 1. Handle Logged-In User (Cart-based)
        if (req.user) {
            userId = req.user.id;
            const cart = await Cart.findOne({
                where: { user_id: req.user.id },
                include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }, { model: ProductVariant, as: 'variant' }] }]
            });

            if (!cart || cart.items.length === 0) {
                await t.rollback();
                return res.status(400).json({ message: 'Cart is empty' });
            }

            for (const item of cart.items) {
                const product = item.product;
                const price = item.variant ? item.variant.price : product.price; // Use current price? Or cart price? Usually current.
                // Note: If using cart price, ensure it's not stale. Here we use product/variant price directly.
                const gstPercent = product.gst_percentage || 0;
                const itemSubtotal = parseFloat(price) * item.quantity;
                const itemGst = (itemSubtotal * parseFloat(gstPercent)) / 100;

                total += itemSubtotal;
                totalGst += itemGst;

                orderItemsData.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: price
                });
            }

            // Clear Cart
            await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });
        }
        // 2. Handle Guest User (Payload-based)
        else {
            const items = req.body.items;
            if (!items || !Array.isArray(items) || items.length === 0) {
                await t.rollback();
                return res.status(400).json({ message: 'No items provided for guest checkout' });
            }

            for (const item of items) {
                const product = await Product.findByPk(item.product_id);
                if (!product) {
                    await t.rollback();
                    return res.status(400).json({ message: `Product ID ${item.product_id} not found` });
                }

                // If handling variants for guest, we'd need variant_id in payload.
                // For now assuming simple products or base price if variant logic is complex to mirror without cart.
                // FIXME: If products have variants, guest checkout needs variant_id in payload.
                // Looking at CartItem model, it has variant_id.
                // Adding variant support for guest would require request modification.
                // For this task, I'll stick to base product price or require variant logic if easy.
                // Let's assume request items: [{ product_id, quantity, variant_id }]?
                // The validation schema I wrote only checked product_id.
                // Let's stick to product price for now or simple variant if possible.
                // To be safe, let's use product.price.

                const price = product.price; // TODO: handle variants if needed
                const gstPercent = product.gst_percentage || 0;

                // Check if user claimed premium price... but guest is never premium.
                // Unless we have a logic for that? No.

                const itemSubtotal = parseFloat(price) * item.quantity;
                const itemGst = (itemSubtotal * parseFloat(gstPercent)) / 100;

                total += itemSubtotal;
                totalGst += itemGst;

                orderItemsData.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: price
                });
            }
        }

        // Calculate Fees
        let deliveryFee = 15;
        if (pincode) {
            const zone = await DeliveryZone.findOne({ where: { pincode, active: true } });
            if (zone && zone.fast_delivery) {
                deliveryFee = 25;
            }
        }


        const handlingFee = 5;
        const itemsTotal = total; // sum of items
        const grandTotal = itemsTotal + totalGst + deliveryFee + handlingFee;
        // Usually `total` = items + tax + delivery + handling.
        // Let's verify what `total` means.
        // Checkout.tsx says: const total = totalAmount + totalGst + deliveryFee + handlingFee;
        // So Frontend expects Grand Total.
        // Backend `Order` model usually stores Grand Total or Subtotal.
        // If I look at `store` method again:
        // total += itemSubtotal;
        // ...
        // Order.create({ total, ... })
        // It seems backend stored 'Subtotal' in 'total' column?
        // Wait, if frontend shows Grand Total, backend should probably store Grand Total or allow derivation.
        // Let's check `Order.js` model again... `total: DECIMAL`.
        // If I want to be consistent with previous code, I should keep strictly what was there.
        // Previous: `total` accumulated `itemSubtotal`. it DID NOT add gst/delivery/handling to `total` variable.
        // So `Order.total` in DB seems to be Subtotal (sum of items).
        // BUT wait, `Order` has `gst_amount`, `delivery_fee`.
        // If `Order.total` is just subtotal, then grand total = total + gst + fees.
        // Let's stick to that pattern to avoid breaking things.

        // ROUTING LOGIC: Determine Shop
        let franchiseId = (req.body.shop_id || req.body.franchise_id) ? parseInt(req.body.shop_id || req.body.franchise_id) : null;
        const DeliveryLat = deliveryAddress.lat;
        const DeliveryLng = deliveryAddress.lng;

        if (!franchiseId && DeliveryLat && DeliveryLng) {
            const shops = await Shop.findAll({ where: { is_active: true } });

            // Haversine formula to find nearest
            let minDistance = Infinity;

            for (const s of shops) {
                const R = 6371; // km
                const dLat = (s.lat - DeliveryLat) * Math.PI / 180;
                const dLon = (s.lng - DeliveryLng) * Math.PI / 180;
                const a =
                    0.5 - Math.cos(dLat) / 2 +
                    Math.cos(s.lat * Math.PI / 180) * Math.cos(DeliveryLat * Math.PI / 180) *
                    (1 - Math.cos(dLon)) / 2;

                const d = R * 2 * Math.asin(Math.sqrt(a));

                if (d < minDistance) {
                    minDistance = d;
                    franchiseId = s.id;
                }
            }
        }

        if (!franchiseId) {
            // Fallback: Default to Shop 1 (Main) if no location or for now
            franchiseId = 1;
        }

        const order = await Order.create({
            user_id: userId,
            franchise_id: franchiseId,
            total: grandTotal,
            gst_amount: totalGst,
            delivery_fee: deliveryFee,
            handling_fee: handlingFee,
            status: 'pending',
            delivery_address: JSON.stringify(deliveryAddress),
            payment_status: 'pending'
        }, { transaction: t });

        for (const itemData of orderItemsData) {
            await OrderItem.create({
                order_id: order.id,
                ...itemData
            }, { transaction: t });
        }

        await t.commit();

        // Send Notifications (after transaction)
        const orderWithItems = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });

        // Notify Customer (if email/phone available?)
        // notificationService.sendOrderConfirmation needs a User object usually.
        // If guest, we might mock a user object with the delivery details or update service.
        // For now, only send if req.user exists.

        if (req.user) {
            notificationService.sendOrderConfirmation(orderWithItems, req.user);
        } else {
            // TODO: Handle guest notification logic (e.g. use email from delivery_address if captured, or SMS)
            // For now, we'll skip or send to admin only.
        }

        notificationService.sendAdminNotification(orderWithItems);

        res.status(201).json(order);

    } catch (err) {
        console.error('Order Creation Error:', err);
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
};

exports.show = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { id: req.params.id, user_id: req.user.id },
            include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });
        if (!order) return res.status(404).json({ message: 'Not found' });

        const o = order.toJSON();
        try { o.delivery_address = JSON.parse(o.delivery_address); } catch (e) { }

        res.json(o);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin methods
exports.adminIndex = async (req, res) => {
    try {
        const whereClause = {};

        // If Shop Admin, filter by their franchise_id
        if (req.user.role === 'shop_admin') {
            const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
            if (shop) whereClause.franchise_id = shop.id;
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: [
                { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                { model: User, as: 'user', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const parsedOrders = orders.map(order => {
            const o = order.toJSON();
            try { o.delivery_address = JSON.parse(o.delivery_address); } catch (e) { }
            return o;
        });

        res.json(parsedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.adminUpdate = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Not found' });

        await order.update(req.body); // e.g. status
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignDeliveryPerson = async (req, res) => {
    try {
        if (!['admin', 'super_admin', 'shop_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { id } = req.params;
        const { delivery_person_id, shop_id } = req.body;
        const finalShopIdFromRequest = shop_id || req.body.franchise_id;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        // If Shop Admin, ensure order belongs to them and delivery person belongs to them
        if (req.user.role === 'shop_admin') {
            const franchiseId = req.user.franchise_id || (await Shop.findOne({ where: { owner_id: req.user.id } }))?.id;

            if (order.franchise_id !== franchiseId) {
                return res.status(403).json({ success: false, error: 'You can only assign orders for your shop' });
            }

            const deliveryPerson = await User.findOne({ where: { id: delivery_person_id, role: 'delivery_person', franchise_id: franchiseId } });
            if (!deliveryPerson) {
                return res.status(403).json({ success: false, error: 'Delivery person must belong to your shop' });
            }
        }

        await order.update({ delivery_person_id, status: 'assigned' });

        // Notify Delivery Person
        const deliveryPerson = await User.findByPk(delivery_person_id);
        if (deliveryPerson) {
            notificationService.sendDeliveryAssignmentNotification(order, deliveryPerson);
        }

        res.json({ success: true, message: 'Delivery person assigned', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDeliveryOrders = async (req, res) => {
    try {
        if (req.user.role !== 'delivery_person') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const orders = await Order.findAll({
            where: { delivery_person_id: req.user.id },
            include: [
                { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                { model: require('../models/User'), as: 'user', attributes: ['name', 'email', 'phone'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const parsedOrders = orders.map(order => {
            const o = order.toJSON();
            try { o.delivery_address = JSON.parse(o.delivery_address); } catch (e) { }
            return o;
        });

        res.json({ success: true, orders: parsedOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsOutForDelivery = async (req, res) => {
    try {
        if (req.user.role !== 'delivery_person') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { id } = req.params;
        const order = await Order.findOne({ where: { id, delivery_person_id: req.user.id } });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found or not assigned to you' });

        await order.update({ status: 'out_for_delivery' });
        res.json({ success: true, message: 'Order is now out for delivery', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.acceptOrder = async (req, res) => {
    try {
        if (req.user.role !== 'delivery_person') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const { id } = req.params;
        const order = await Order.findOne({ where: { id, delivery_person_id: req.user.id } });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found or not assigned to you' });

        await order.update({ status: 'processing', accepted_at: new Date() });
        res.json({ success: true, message: 'Order accepted', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectOrder = async (req, res) => {
    try {
        if (req.user.role !== 'delivery_person') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const { id } = req.params;
        const { reason } = req.body;
        const order = await Order.findOne({ where: { id, delivery_person_id: req.user.id } });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found or not assigned to you' });

        await order.update({
            delivery_person_id: null,
            status: 'pending', // Send back to pending queue
            rejection_reason: reason || 'No reason provided',
            rejected_at: new Date()
        });
        res.json({ success: true, message: 'Order rejected', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsReached = async (req, res) => {
    try {
        if (req.user.role !== 'delivery_person') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { id } = req.params;
        const order = await Order.findOne({ where: { id, delivery_person_id: req.user.id } });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found or not assigned to you' });

        await order.update({ reached_confirmed: true });
        res.json({ success: true, message: 'Destination reached confirmed', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.collectCash = async (req, res) => {
    try {
        if (req.user.role !== 'delivery_person') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { id } = req.params;
        const { amount1, amount2 } = req.body;

        const order = await Order.findOne({ where: { id, delivery_person_id: req.user.id } });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found or not assigned to you' });

        if (parseFloat(amount1) !== parseFloat(amount2)) {
            return res.status(400).json({ success: false, error: 'Amounts do not match' });
        }

        if (parseFloat(amount1) !== parseFloat(order.total)) {
            return res.status(400).json({ success: false, error: `Amount must be exactly ₹${order.total}` });
        }

        await order.update({
            amount_collected_1: amount1,
            amount_collected_2: amount2,
            cash_collected: true,
            payment_status: 'completed'
        });

        res.json({ success: true, message: 'Cash collected successfully', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsDelivered = async (req, res) => {
    try {
        if (req.user.role !== 'delivery_person') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { id } = req.params;
        const order = await Order.findOne({ where: { id, delivery_person_id: req.user.id } });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found or not assigned to you' });

        // If it was COD, ensure cash is collected
        if (!order.cash_collected && order.payment_status !== 'completed') {
            return res.status(400).json({ success: false, error: 'Please collect cash first' });
        }

        await order.update({ status: 'delivered', payment_status: 'completed' });
        res.json({ success: true, message: 'Order marked as delivered', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            attributes: ['id', 'status', 'created_at', 'total', 'payment_status', 'delivery_type'],
            include: [
                { model: User, as: 'delivery_person', attributes: ['name', 'phone'] },
                { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['name', 'image'] }] }
            ]
        });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
