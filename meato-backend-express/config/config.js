require('dotenv').config();
const path = require('path');

module.exports = {
    development: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_DATABASE || 'vaagai_db',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: process.env.DB_CONNECTION || 'sqlite',
        storage: path.join(__dirname, '../database.sqlite')
    },
    test: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_DATABASE || 'vaagai_test',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        dialect: process.env.DB_CONNECTION || 'mysql',
        logging: false
    }
};
