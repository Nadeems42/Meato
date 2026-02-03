const Sequelize = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

console.log('DB_CONNECTION:', process.env.DB_CONNECTION);

if (process.env.NODE_ENV === 'test') {
    sequelize = new Sequelize('sqlite::memory:', {
        logging: false
    });
} else if (process.env.DB_CONNECTION === 'sqlite') {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database.sqlite'),
        logging: false
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_DATABASE || 'vaagai',
        process.env.DB_USERNAME || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || '127.0.0.1',
            dialect: 'mysql',
            logging: false,
        }
    );
}

module.exports = sequelize;
