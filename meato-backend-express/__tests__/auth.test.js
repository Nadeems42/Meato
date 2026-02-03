const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const { User } = require('../models');

beforeAll(async () => {
    // Sync database before tests
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    // Close database connection after tests
    await sequelize.close();
});

describe('Auth API', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not register a user with existing email', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                name: 'Another User',
                email: 'test@example.com',
                password: 'password456'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });
});
