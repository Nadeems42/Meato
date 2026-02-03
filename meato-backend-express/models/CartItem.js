const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cart = require('./Cart');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');

const CartItem = sequelize.define('CartItem', {
    cart_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Cart, key: 'id' } },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: 'id' } },
    variant_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: ProductVariant, key: 'id' } },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
}, {
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['cart_id', 'product_id', 'variant_id']
        }
    ]
});

module.exports = CartItem;
