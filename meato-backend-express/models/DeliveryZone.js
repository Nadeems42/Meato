const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryZone = sequelize.define('DeliveryZone', {
    name: { type: DataTypes.STRING, allowNull: false },
    pincode: { type: DataTypes.STRING, allowNull: false },
    lat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    lng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    radius_km: { type: DataTypes.DECIMAL(5, 2), defaultValue: 5.0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    fast_delivery: { type: DataTypes.BOOLEAN, defaultValue: false, comment: 'Eligible for 10-min fast delivery' },

    franchise_id: { type: DataTypes.INTEGER, allowNull: true },
    is_approved: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'delivery_zones', timestamps: true, underscored: true });

module.exports = DeliveryZone;
