const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const ProductVariant = sequelize.define('ProductVariant', {
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: 'id' } },
    variant_name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    stock_qty: { type: DataTypes.INTEGER, defaultValue: 0 },
    image_path: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'product_variants', timestamps: true, underscored: true });

module.exports = ProductVariant;
