const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Circular dependency possible? Handle in index.

const Order = sequelize.define('Order', {
    user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: User, key: 'id' } },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    delivery_type: { type: DataTypes.STRING, defaultValue: 'standard' },
    payment_status: { type: DataTypes.STRING, defaultValue: 'pending' },
    delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('delivery_address');
            try {
                return rawValue ? JSON.parse(rawValue) : null;
            } catch (e) {
                return rawValue; // Fallback to raw string if not JSON
            }
        }
    },
    gst_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    handling_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    delivery_person_id: { type: DataTypes.INTEGER, allowNull: true },

    // The franchise this order belongs to
    franchise_id: { type: DataTypes.INTEGER, allowNull: true },
    shop_id: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.franchise_id;
        }
    },

    // Delivery Partner Workflow Fields
    reached_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
    amount_collected_1: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    amount_collected_2: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    cash_collected: { type: DataTypes.BOOLEAN, defaultValue: false },

    // New Fields for Redesigned App
    rejection_reason: { type: DataTypes.STRING, allowNull: true },
    accepted_at: { type: DataTypes.DATE, allowNull: true },
    rejected_at: { type: DataTypes.DATE, allowNull: true },

}, { tableName: 'orders', timestamps: true, underscored: true });

module.exports = Order;
