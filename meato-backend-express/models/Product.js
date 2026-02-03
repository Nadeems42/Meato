const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');

const Product = sequelize.define('Product', {
    category_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: Category, key: 'id' } },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },

    mrp: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, // Crossed out price
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Standard Discounted Price

    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.STRING, allowNull: true },
    gst_percentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
    franchise_id: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'products', timestamps: true, underscored: true });

module.exports = Product;
