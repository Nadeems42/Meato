const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
    order_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Order, key: 'id' } },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: 'id' } },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'order_items', timestamps: true, underscored: true });

module.exports = OrderItem;
