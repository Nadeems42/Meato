const bcrypt = require('bcryptjs');
const { User, Category, Product, ProductVariant, DeliveryZone, Setting, Franchise, FranchiseProduct } = require('./models');
const sequelize = require('./config/database');

async function seed() {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced (forced reset).');

        // 1. Admin User
        const adminPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@meato.com',
            password: adminPassword,
            role: 'super_admin',
            phone: '8605082096'
        });
        console.log('Admin user created: admin@meato.com / password123');

        // 1.1 Regular Users
        const userPassword = await bcrypt.hash('password123', 10);
        await User.bulkCreate([
            { name: 'John Customer', email: 'john@example.com', password: userPassword, role: 'user', phone: '9876543210' },
            { name: 'Sarah Customer', email: 'sarah@example.com', password: userPassword, role: 'user', phone: '9876543211' },
            { name: 'Mike Customer', email: 'mike@example.com', password: userPassword, role: 'user', phone: '9876543212' },
            { name: 'Shop Admin', email: 'franchise@meato.com', password: userPassword, role: 'shop_admin', phone: '9876543220' },
            { name: 'Delivery Person', email: 'delivery@meato.com', password: userPassword, role: 'delivery_person', phone: '9876543221' }
        ]);
        console.log('Customers seeded.');

        // 2. Categories
        const categories = await Category.bulkCreate([
            { name: 'Chicken', slug: 'chicken', image: '/products/chicken_whole.png' },
            { name: 'Mutton', slug: 'mutton', image: '/products/mutton_curry.png' },
            { name: 'Eggs', slug: 'eggs', image: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=400&q=80' }
        ]);
        console.log('Categories seeded.');

        // 3. Products
        const prodData = [
            // Chicken (cat: 0)
            { cat: 0, name: 'Fresh Whole Chicken', desc: 'Farm-fresh whole chicken, tender and juicy. Perfect for roasting, grilling, or curries.', price: 180, mrp: 220, img: '/products/chicken_whole.png' },
            { cat: 0, name: 'Chicken Breast - Boneless', desc: 'Lean, high-protein boneless chicken breast fillets. Ideal for salads, grilling, or stir-fries.', price: 240, mrp: 280, img: '/products/chicken_breast.png' },
            { cat: 0, name: 'Chicken Lollipop', desc: 'Succulent chicken wings cut into lollipop shapes.', price: 150, mrp: 180, img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80' },
            { cat: 0, name: 'Chicken Wings', desc: 'Fresh chicken wings, perfect for frying or grilling.', price: 120, mrp: 150, img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80' },

            // Mutton (cat: 1)
            { cat: 1, name: 'Premium Mutton Curry Cut', desc: 'Premium goat meat, perfectly cut for rich and flavorful curries. Tender and succulent.', price: 750, mrp: 850, img: '/products/mutton_curry.png' },
            { cat: 1, name: 'Mutton Keema', desc: 'Finely minced fresh mutton, ideal for keema recipes.', price: 380, mrp: 450, img: 'https://images.unsplash.com/photo-1593560737060-e110c793ffcc?w=400&q=80' },
            { cat: 1, name: 'Mutton Chops', desc: 'Prime mutton chops, tender and juicy.', price: 420, mrp: 500, img: 'https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=400&q=80' },

            // Eggs (cat: 2)
            { cat: 2, name: 'Farm Fresh Brown Eggs', desc: 'Nutritious brown eggs sourced from local farms.', price: 90, mrp: 110, img: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=400&q=80' },
            { cat: 2, name: 'Organic White Eggs', desc: 'Standard white eggs, high in protein and fresh.', price: 150, mrp: 180, img: 'https://images.unsplash.com/photo-1587486918502-319c9e8dc921?w=400&q=80' },

        ];

        for (const p of prodData) {
            const product = await Product.create({
                category_id: categories[p.cat].id,
                name: p.name,
                description: p.desc,
                price: p.price,
                mrp: p.mrp || p.price * 1.2,
                stock: 100,
                image: p.img
            });

            await ProductVariant.create({
                product_id: product.id,
                variant_name: 'Standard',
                price: p.price,
                stock_qty: 100
            });
        }

        console.log('Products seeded.');

        // 4. Delivery Zones
        await DeliveryZone.create({
            name: 'Buldhana Central',
            pincode: '443001',
            lat: 20.5312,
            lng: 76.1856,
            radius_km: 10.0,
            fast_delivery: true
        });
        console.log('Delivery zones seeded.');

        // 5. Hero & Brand Settings
        const heroSettings = [
            { key: 'hero_title', value: 'Premium Meat & Organic Eggs' },
            { key: 'hero_subtitle', value: 'Fresh from the farm to your doorstep in 15 minutes. Quality you can trust.' },
            { key: 'hero_badge', value: '10-MIN EXPRESS DELIVERY' },
            { key: 'hero_button_text', value: 'Shop Meat' },
            { key: 'hero_secondary_button_text', value: 'View Eggs' },
            { key: 'hero_image', value: '/products/chicken_whole.png' },
            { key: 'hero_bg_image', value: '/hero-meat-background.jpg' }
        ];

        for (const s of heroSettings) {
            await Setting.create(s);
        }
        console.log('Settings seeded.');

        // 6. Create Main Franchise
        const mainFranchise = await Franchise.create({
            name: 'Meato Main Branch (Buldhana)',
            address: 'Main Market, Buldhana',
            lat: 20.5312,
            lng: 76.1856,
            delivery_radius_km: 15.0,
            commission_percentage: 10.0,
            base_delivery_fee: 40.0,
            owner_id: 1, // Admin User
            is_active: true
        });
        console.log('Main Franchise created.');

        // 7. Link Products to Franchise (Inventory)
        const products = await Product.findAll();
        for (const p of products) {
            await FranchiseProduct.create({
                franchise_id: mainFranchise.id,
                product_id: p.id,
                is_enabled: true,
                stock: 50, // Default stock for franchise
                price_override: null // Use master price
            });
        }
        console.log('Franchise Inventory linked.');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
