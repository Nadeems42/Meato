const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const { User, Order, Product, Category, DeliveryZone } = require('../models');

describe('Delivery System Flow', () => {
    let adminToken;
    let deliveryToken;
    let userToken;
    let orderId;
    let deliveryPersonId;
    let userId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Create Super Admin
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Super Admin',
            email: 'admin@vaagai.com',
            password: hashedPassword,
            role: 'super_admin',
            phone: '1234567890'
        });

        // Create Category and Product
        const cat = await Category.create({ name: 'Test Cat', slug: 'test-cat' });
        await Product.create({
            category_id: cat.id,
            name: 'Test Product',
            description: 'Desc',
            price: 100,
            stock: 10,
            image: 'http://example.com/img.jpg'
        });
    });

    // Helper to create unique user
    const uniqueId = Date.now();
    const adminEmail = `admin_${uniqueId}@test.com`;
    const deliveryEmail = `delivery_${uniqueId}@test.com`;
    const userEmail = `user_${uniqueId}@test.com`;

    it('should login as Super Admin', async () => {
        // Use default seeded admin
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'admin@vaagai.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        adminToken = res.body.token;
    });

    it('should create a delivery person', async () => {
        const res = await request(app)
            .post('/api/admin/create-delivery-person')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Delivery Person',
                email: deliveryEmail,
                password: 'password123',
                phone: '9876543210'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.role).toEqual('delivery_person');
        deliveryPersonId = res.body.user.id;
    });

    it('should login as delivery person', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: deliveryEmail,
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        deliveryToken = res.body.token;
    });

    it('should create a regular user', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                name: 'Regular Customer',
                email: userEmail,
                password: 'password123',
                phone: '1231231234'
            });

        expect(res.statusCode).toEqual(201);
        userToken = res.body.token;
        userId = res.body.user.id;
    });

    it('should place an order as user', async () => {
        // Create an order. Assuming at least one product exists.
        // If not, we create one, but let's try fetch first.
        let products = (await request(app).get('/api/products')).body;

        if (products.length === 0) {
            // Need to create a product as admin
            // First create category
            const catRes = await request(app).post('/api/categories').send({ name: 'Test Cat', slug: 'test-cat' });
            // The dummy endpoint returns 200 message "Not Implemented Yet" ?
            // Ah routes/api.js:104: router.post('/categories', dummy);
            // So we can't create category via API? Seed must have run.
            // If seed didn't run, this test block might fail.
            // Let's hope seed ran.
        }

        const productId = products.length > 0 ? products[0].id : 1;

        // If products array is empty, this step will likely fail or we mock it.
        // Assuming database has seed data.



        // Step 4a: Add to cart
        const cartRes = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                product_id: productId,
                quantity: 1
            });

        expect([200, 201]).toContain(cartRes.status);

        // Step 4b: Place Order
        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                delivery_address: {
                    street: "123 Test St",
                    city: "Test City",
                    pincode: "123456",
                    state: "State"
                }
            });



        expect(orderRes.statusCode).toEqual(201);
        orderId = orderRes.body.id;
    });

    it('should assign order to delivery person', async () => {
        const res = await request(app)
            .put(`/api/admin/orders/${orderId}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                delivery_person_id: deliveryPersonId
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.order.delivery_person_id).toEqual(deliveryPersonId);
    });

    it('should view assigned orders as delivery person', async () => {
        const res = await request(app)
            .get('/api/delivery/orders')
            .set('Authorization', `Bearer ${deliveryToken}`);

        expect(res.statusCode).toEqual(200);
        // Find our order
        // The response structure is { success: true, orders: [] }
        const order = res.body.orders.find(o => o.id === orderId);
        expect(order).toBeDefined();
    });

    it('should mark order as delivered', async () => {
        const res = await request(app)
            .put(`/api/delivery/orders/${orderId}/deliver`)
            .set('Authorization', `Bearer ${deliveryToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.order.status).toEqual('delivered');
    });
});
