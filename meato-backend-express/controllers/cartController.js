const { Cart, CartItem, Product, ProductVariant } = require('../models');

exports.index = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { user_id: req.user.id },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }, { model: ProductVariant, as: 'variant' }]
                }
            ]
        });
        // Return items directly to match assumed API shape or return cart
        res.json(cart ? cart.items : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.store = async (req, res) => {
    try {
        const { product_id, variant_id, quantity } = req.body;
        let cart = await Cart.findOne({ where: { user_id: req.user.id } });
        if (!cart) cart = await Cart.create({ user_id: req.user.id });

        // Check if item exists
        const existingItem = await CartItem.findOne({
            where: { cart_id: cart.id, product_id, variant_id: variant_id || null }
        });

        if (existingItem) {
            existingItem.quantity += quantity || 1;
            await existingItem.save();
        } else {
            await CartItem.create({
                cart_id: cart.id,
                product_id,
                variant_id: variant_id || null,
                quantity: quantity || 1
            });
        }

        // Return updated cart items
        const updatedCart = await Cart.findOne({
            where: { user_id: req.user.id },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }, { model: ProductVariant, as: 'variant' }]
                }
            ]
        });

        res.json(updatedCart.items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.destroy = async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { user_id: req.user.id } });
        if (cart) {
            // Logic differs: payload might be CartItemId or ProductId. 
            // Assuming ProductId based on PHP route /cart/{productId}
            // But what about variants? PHP migration suggests filtering by Product ID.
            await CartItem.destroy({ where: { cart_id: cart.id, product_id: req.params.productId } });
        }
        res.json({ message: 'Item removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clear = async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { user_id: req.user.id } });
        if (cart) {
            await CartItem.destroy({ where: { cart_id: cart.id } });
        }
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
