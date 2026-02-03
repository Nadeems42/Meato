'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Users
        await queryInterface.createTable('users', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, unique: true, allowNull: false },
            phone: { type: Sequelize.STRING, allowNull: true },
            role: { type: Sequelize.STRING, defaultValue: 'user' },
            password: { type: Sequelize.STRING, allowNull: false },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 2. Categories
        await queryInterface.createTable('categories', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, unique: true, allowNull: false },
            image: { type: Sequelize.STRING, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 3. Products
        await queryInterface.createTable('products', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'categories', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            name: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            stock: { type: Sequelize.INTEGER, defaultValue: 0 },
            image: { type: Sequelize.STRING, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 4. Product Variants
        await queryInterface.createTable('product_variants', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            variant_name: { type: Sequelize.STRING, allowNull: false },
            price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            discount_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
            stock_qty: { type: Sequelize.INTEGER, defaultValue: 0 },
            image_path: { type: Sequelize.STRING, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 5. Carts
        await queryInterface.createTable('carts', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 6. Cart Items
        await queryInterface.createTable('cart_items', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            cart_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'carts', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            variant_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'product_variants', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 7. Delivery Zones
        await queryInterface.createTable('delivery_zones', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false },
            pincode: { type: Sequelize.STRING, allowNull: false },
            radius_km: { type: Sequelize.INTEGER, defaultValue: 5 },
            active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 8. Addresses
        await queryInterface.createTable('addresses', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            type: { type: Sequelize.STRING, defaultValue: 'home' },
            address_line1: { type: Sequelize.STRING, allowNull: false },
            address_line2: { type: Sequelize.STRING, allowNull: true },
            city: { type: Sequelize.STRING, allowNull: false },
            state: { type: Sequelize.STRING, allowNull: false },
            pincode: { type: Sequelize.STRING, allowNull: false },
            is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 9. Orders
        await queryInterface.createTable('orders', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            status: { type: Sequelize.STRING, defaultValue: 'pending' },
            delivery_type: { type: Sequelize.STRING, defaultValue: 'standard' },
            payment_status: { type: Sequelize.STRING, defaultValue: 'pending' },
            delivery_address: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 10. Order Items
        await queryInterface.createTable('order_items', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'orders', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            quantity: { type: Sequelize.INTEGER, allowNull: false },
            price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        // 11. Settings
        await queryInterface.createTable('settings', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            key: { type: Sequelize.STRING, unique: true, allowNull: false },
            value: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('settings');
        await queryInterface.dropTable('order_items');
        await queryInterface.dropTable('orders');
        await queryInterface.dropTable('addresses');
        await queryInterface.dropTable('delivery_zones');
        await queryInterface.dropTable('cart_items');
        await queryInterface.dropTable('carts');
        await queryInterface.dropTable('product_variants');
        await queryInterface.dropTable('products');
        await queryInterface.dropTable('categories');
        await queryInterface.dropTable('users');
    }
};
