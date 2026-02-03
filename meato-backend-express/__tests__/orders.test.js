const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const { User, Category, Product, Cart, CartItem, Order } = require('../models');
const bcrypt = require('bcryptjs');

let userToken;
let adminToken;
let productId;

beforeAll(async () => {
    // Force sync for clean state
    await sequelize.sync({ force: true });

    // 1. Create User
    const userPassword = await bcrypt.hash('password123', 10);
    await User.create({
        name: 'Regular User',
        email: 'user@example.com',
        password: userPassword,
        role: 'user'
    });

    // 2. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
        name: 'Admin User',
        email: 'admin@vaagai.com',
        password: adminPassword,
        role: 'super_admin'
    });

    // Login User
    const userLogin = await request(app).post('/api/login').send({ email: 'user@example.com', password: 'password123' });
    userToken = userLogin.body.token;

    // Login Admin
    const adminLogin = await request(app).post('/api/login').send({ email: 'admin@vaagai.com', password: 'admin123' });
    adminToken = adminLogin.body.token;

    // Create Category and Product
    const cat = await Category.create({ name: 'Fruits', slug: 'fruits' });
    const prod = await Product.create({
        category_id: cat.id,
        name: 'Apple',
        price: 100,
        stock: 50
    });
    productId = prod.id;
});

afterAll(async () => {
    await sequelize.close();
});

describe('Cart & Orders Full Flow', () => {

    describe('Cart API', () => {
        it('should start with an empty cart', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([]);
        });

        it('should add an item to cart', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ product_id: productId, quantity: 2 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].product_id).toBe(productId);
            expect(res.body[0].quantity).toBe(2);
        });

        it('should update quantity if item added again', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ product_id: productId, quantity: 1 });

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].quantity).toBe(3);
        });
    });

    describe('Orders API', () => {
        it('should place an order', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    delivery_address: {
                        street: '123 Main St',
                        city: 'Chennai',
                        pincode: '600001',
                        state: 'Tamil Nadu'
                    }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('pending');
            expect(parseFloat(res.body.total)).toBe(300); // 100 * 3
        });

        it('should show the order in user history', async () => {
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].total).toBe(300);
        });

        it('should mark cart as empty after order', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([]);
        });
    });

    describe('Admin Order Management', () => {
        it('should allow admin to list all orders', async () => {
            const res = await request(app)
                .get('/api/admin/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0].user.email).toBe('user@example.com');
        });

        it('should allow admin to update order status', async () => {
            // Get order ID from previous list
            const listRes = await request(app)
                .get('/api/admin/orders')
                .set('Authorization', `Bearer ${adminToken}`);
            const orderId = listRes.body[0].id;

            const res = await request(app)
                .put(`/api/admin/orders/${orderId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'processing' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('processing');
        });

        it('should reject unauthorized admin access', async () => {
            const res = await request(app)
                .get('/api/admin/orders')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });
});
