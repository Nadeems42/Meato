const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Cart = sequelize.define('Cart', {
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
}, { tableName: 'carts', timestamps: true, underscored: true });

module.exports = Cart;
