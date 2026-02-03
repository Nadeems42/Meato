const bcrypt = require('bcryptjs');
const { User, Category, Product, ProductVariant, DeliveryZone, Setting, Shop, ShopProduct, Order, OrderItem } = require('./models');
const sequelize = require('./config/database');

async function seedDemo() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Clear existing demo-related data
        // We'll be selective to avoid wiping everything if possible, but force reset for products/orders
        await OrderItem.destroy({ where: {}, truncate: false });
        await Order.destroy({ where: {}, truncate: false });
        await ShopProduct.destroy({ where: {}, truncate: false });
        await ProductVariant.destroy({ where: {}, truncate: false });
        await Product.destroy({ where: {}, truncate: false });
        await Category.destroy({ where: {}, truncate: false });
        // NOTE: We keep Users for now but will ensure our specific ones exist

        console.log('Cleared existing product and order data.');

        const password = await bcrypt.hash('password123', 10);

        // 1. Ensure Super Admin
        const [superAdmin] = await User.findOrCreate({
            where: { email: 'admin@meato.com' },
            defaults: {
                name: 'Super Admin',
                password,
                role: 'super_admin',
                phone: '8605082096',
                is_verified: true
            }
        });
        if (superAdmin.password !== password) {
            await superAdmin.update({ password });
        }
        console.log('Super Admin ensured.');

        // 2. Ensure Shop Admin
        const [shopAdmin] = await User.findOrCreate({
            where: { email: 'franchise@meato.com' },
            defaults: {
                name: 'Main Shop Admin',
                password,
                role: 'shop_admin',
                phone: '9876543220',
                is_verified: true
            }
        });
        if (shopAdmin.password !== password) {
            await shopAdmin.update({ password });
        }
        console.log('Shop Admin ensured.');

        // 3. Ensure Delivery Rider
        const [rider] = await User.findOrCreate({
            where: { email: 'verified_rider@meato.com' },
            defaults: {
                name: 'Verified Rider',
                password,
                role: 'delivery_person',
                phone: '9876543210',
                is_verified: true
            }
        });
        if (rider.password !== password) {
            await rider.update({ password });
        }
        console.log('Delivery Rider ensured.');

        // 4. Categories
        const categories = await Category.bulkCreate([
            { name: 'Chicken', slug: 'chicken', image: '/products/chicken_whole.png', is_approved: true },
            { name: 'Mutton', slug: 'mutton', image: '/products/mutton_curry.png', is_approved: true },
            { name: 'Eggs', slug: 'eggs', image: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=400&q=80', is_approved: true }
        ]);
        console.log('Categories seeded.');

        // 5. Products
        const prodData = [
            { cat: 0, name: 'Fresh Whole Chicken', price: 180, stock: 100, img: '/products/chicken_whole.png' },
            { cat: 0, name: 'Chicken Breast', price: 240, stock: 100, img: '/products/chicken_breast.png' },
            { cat: 1, name: 'Premium Mutton Curry Cut', price: 750, stock: 50, img: '/products/mutton_curry.png' },
            { cat: 2, name: 'Farm Fresh Brown Eggs', price: 90, stock: 200, img: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=400&q=80' }
        ];

        const products = [];
        for (const p of prodData) {
            const product = await Product.create({
                category_id: categories[p.cat].id,
                name: p.name,
                description: `Fresh and quality ${p.name} delivered to your door.`,
                price: p.price,
                mrp: Math.round(p.price * 1.2),
                stock: p.stock,
                image: p.img,
                is_approved: true
            });
            products.push(product);

            await ProductVariant.create({
                product_id: product.id,
                variant_name: '500g',
                price: p.price,
                stock_qty: p.stock
            });
        }
        console.log('Products seeded.');

        // 6. Shop
        const [shop] = await Shop.findOrCreate({
            where: { owner_id: shopAdmin.id },
            defaults: {
                name: 'Meato Buldhana Store',
                address: 'Market Yard, Buldhana, Maharashtra',
                lat: 20.5312,
                lng: 76.1856,
                delivery_radius_km: 15.0,
                commission_percentage: 10.0,
                base_delivery_fee: 40.0,
                is_active: true
            }
        });
        console.log('Shop ensured.');

        // 7. Inventory
        for (const p of products) {
            await ShopProduct.create({
                franchise_id: shop.id,
                product_id: p.id,
                is_enabled: true,
                stock: p.stock,
                price_override: null
            });
        }
        console.log('Shop Inventory linked.');

        // 8. Demo Order
        const demoOrder = await Order.create({
            user_id: shopAdmin.id, // Using shopAdmin as a customer for the demo order
            total: 310, // 180 (Chicken) + 90 (Eggs) + 40 (Fee)
            status: 'assigned',
            delivery_type: 'standard',
            payment_status: 'pending',
            delivery_address: JSON.stringify({
                address: '123 Test Street, Buldhana',
                city: 'Buldhana',
                pincode: '443001'
            }),
            delivery_fee: 40.0,
            franchise_id: shop.id,
            delivery_person_id: rider.id
        });

        await OrderItem.create({
            order_id: demoOrder.id,
            product_id: products[0].id, // Chicken
            quantity: 1,
            price: 180,
            total: 180
        });

        await OrderItem.create({
            order_id: demoOrder.id,
            product_id: products[3].id, // Eggs
            quantity: 1,
            price: 90,
            total: 90
        });

        console.log('Demo Order created and assigned to rider.');

        console.log('--- DEMO SEEDING COMPLETED ---');
        console.log('Admin Email: admin@meato.com / password123');
        console.log('Shop Admin Email: franchise@meato.com / password123');
        console.log('Delivery Rider Email: verified_rider@meato.com / password123');

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedDemo();
