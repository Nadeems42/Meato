const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    phone: { type: DataTypes.STRING, unique: true, allowNull: false }, // Made unique and required
    role: { type: DataTypes.STRING, defaultValue: 'user' },
    password: { type: DataTypes.STRING, allowNull: true },

    wallet_balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },

    // For Franchise Admins, Staff, or Delivery Partners linked to a specific store
    franchise_id: { type: DataTypes.INTEGER, allowNull: true },
    shop_id: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.franchise_id;
        }
    }

}, { tableName: 'users', timestamps: true, underscored: true });

module.exports = User;
