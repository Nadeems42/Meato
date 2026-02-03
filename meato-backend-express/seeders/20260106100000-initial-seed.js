'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const adminPassword = await bcrypt.hash('password123', 10);

        // Users
        await queryInterface.bulkInsert('users', [{
            name: 'Vaagai Market Admin',
            email: 'vaagaimarket@gmail.com',
            password: adminPassword,
            role: 'super_admin',
            phone: '+91 9600713333',
            created_at: new Date(),
            updated_at: new Date()
        }]);

        // Categories
        const categories = await queryInterface.bulkInsert('categories', [
            { name: 'Fruits', slug: 'fruits', created_at: new Date(), updated_at: new Date() },
            { name: 'Vegetables', slug: 'vegetables', created_at: new Date(), updated_at: new Date() },
            { name: 'Dairy', slug: 'dairy', created_at: new Date(), updated_at: new Date() }
        ]);

        // We need IDs for products, but bulkInsert might not return them in all dialects easily 
        // For SQLite/MySQL we can query them back or just assume 1, 2, 3 if it was fresh.

        // Products
        await queryInterface.bulkInsert('products', [
            {
                category_id: 1, // Fruits
                name: 'Red Apple',
                description: 'Fresh organic red apples',
                price: 120.00,
                stock: 50,
                image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                category_id: 3, // Dairy
                name: 'Fresh Milk',
                description: 'Pure cow milk',
                price: 30.00,
                stock: 100,
                image: 'https://images.unsplash.com/photo-1563636619-e910f89ff169',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);

        // Product Variants
        await queryInterface.bulkInsert('product_variants', [
            {
                product_id: 1,
                variant_name: '1kg',
                price: 120.00,
                stock_qty: 50,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_id: 2,
                variant_name: '500ml',
                price: 30.00,
                stock_qty: 100,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);

        // Delivery Zones
        await queryInterface.bulkInsert('delivery_zones', [
            {
                name: 'Sivagiri Area (Fast Delivery)',
                pincode: '638109',
                radius_km: 5,
                active: true,
                fast_delivery: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Erode City',
                pincode: '638001',
                radius_km: 10,
                active: true,
                fast_delivery: false,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);

        // Settings
        await queryInterface.bulkInsert('settings', [{
            key: 'hero_image',
            value: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
            created_at: new Date(),
            updated_at: new Date()
        }]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('settings', null, {});
        await queryInterface.bulkDelete('delivery_zones', null, {});
        await queryInterface.bulkDelete('product_variants', null, {});
        await queryInterface.bulkDelete('products', null, {});
        await queryInterface.bulkDelete('categories', null, {});
        await queryInterface.bulkDelete('users', null, {});
    }
};
