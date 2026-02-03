const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FranchiseProduct = sequelize.define('FranchiseProduct', {
    franchise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'franchises', key: 'id' }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' }
    },

    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },

    // Override price. If null, use the master product price.
    price_override: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

    // Franchise specific stock
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },

}, {
    tableName: 'franchise_products',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['franchise_id', 'product_id']
        }
    ]
});

module.exports = FranchiseProduct;
