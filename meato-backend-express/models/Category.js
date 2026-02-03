const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
    franchise_id: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'categories', timestamps: true, underscored: true });

module.exports = Category;
