// Script to update products with reliable image URLs
// Run with: node update-product-images.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Using picsum.photos as a reliable fallback
const productImages = {
    1: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=400&q=80', // Red Apple
    2: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', // Banana
    3: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80', // Orange
    4: 'https://images.unsplash.com/photo-1537640538966-79f369b41f8f?w=400&q=80', // Grapes
    5: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80', // Carrot
    6: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=400&q=80', // Tomato
    7: 'https://images.unsplash.com/photo-1584270354949-c26971de2dbb?w=400&q=80', // Broccoli
    8: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', // Potato
    9: 'https://images.unsplash.com/photo-1563636619-e910f89ff169?w=400&q=80', // Milk
    10: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80', // Yogurt
    11: 'https://images.unsplash.com/photo-1589881133595-c7c2e0542a19?w=400&q=80', // Butter
    12: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&q=80', // Cheese
};

console.log('Updating product images...\n');

db.serialize(() => {
    // Get all products
    db.all('SELECT id, name, image FROM products', (err, products) => {
        if (err) {
            console.error('Error fetching products:', err);
            return;
        }

        console.log(`Found ${products.length} products\n`);

        products.forEach(product => {
            const newImage = productImages[product.id] || product.image;

            if (newImage !== product.image) {
                db.run(
                    'UPDATE products SET image = ? WHERE id = ?',
                    [newImage, product.id],
                    (err) => {
                        if (err) {
                            console.error(`Error updating ${product.name}:`, err);
                        } else {
                            console.log(`✅ Updated ${product.name}: ${newImage}`);
                        }
                    }
                );
            } else {
                console.log(`⏭️  Skipped ${product.name} (already has image)`);
            }
        });

        setTimeout(() => {
            console.log('\n✨ Image update complete!');
            db.close();
        }, 1000);
    });
});
