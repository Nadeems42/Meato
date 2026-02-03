const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const { User, Category, Product } = require('../models');
const bcrypt = require('bcryptjs');

let adminToken;
let categoryId;

beforeAll(async () => {
    // Force sync for clean state
    await sequelize.sync({ force: true });

    // Create Admin User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await User.create({
        name: 'Super Admin',
        email: 'admin@vaagai.com',
        password: hashedPassword,
        role: 'super_admin'
    });

    // Login to get token
    const loginRes = await request(app)
        .post('/api/login')
        .send({
            email: 'admin@vaagai.com',
            password: 'password123'
        });
    adminToken = loginRes.body.token;

    // Create a Category
    const cat = await Category.create({ name: 'Fruits', slug: 'fruits' });
    categoryId = cat.id;
});

afterAll(async () => {
    await sequelize.close();
});

describe('Product API', () => {
    it('should list products (public)', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should fail to create product without token', async () => {
        const res = await request(app)
            .post('/api/products')
            .field('name', 'Banana')
            .field('price', '10.00');

        expect(res.statusCode).toBeGreaterThanOrEqual(400); // 401 or 403 usually
    });

    it('should create a product with token (multipart)', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('name', 'Banana')
            .field('description', 'Yellow fruit')
            .field('price', '15.50')
            .field('stock', '100')
            .field('category_id', categoryId)
            // .attach('image', 'path/to/test/image.jpg') // mocking image upload is optional if I rely on optional image
            ;

        if (res.statusCode !== 201) {
            console.log('Create Product Error:', res.body);
        }
        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual('Banana');
    });

    it('should show the created product', async () => {
        // Get the product created in previous step
        const listRes = await request(app).get('/api/products');
        const product = listRes.body.find(p => p.name === 'Banana');
        expect(product).toBeTruthy();

        const res = await request(app).get(`/api/products/${product.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Banana');
    });
});
