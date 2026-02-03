const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Franchise = sequelize.define('Franchise', {
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    lat: { type: DataTypes.DECIMAL(10, 6), allowNull: false },
    lng: { type: DataTypes.DECIMAL(10, 6), allowNull: false },

    delivery_radius_km: { type: DataTypes.DECIMAL(5, 2), defaultValue: 5.0 },
    commission_percentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.0 },
    base_delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },

    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

    // Link to an owner/admin user
    owner_id: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'franchises', timestamps: true, underscored: true });

module.exports = Franchise;
