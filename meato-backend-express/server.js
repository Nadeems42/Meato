const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config(); // Load env vars before other imports

const validateEnv = require('./config/env');
validateEnv();

const sequelize = require('./config/database');
const path = require('path');
const errorHandler = require('./middleware/error');


const app = express();
const PORT = process.env.PORT || 8000;

// Logging
app.use(morgan('dev'));

// Security Middleware
app.use(helmet());

// CORS configuration - specifying origins and allowing credentials
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (images)
app.use('/storage', express.static(path.join(__dirname, 'public/storage')));

// Test DB Connection
sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));

// Routes
app.use('/api', require('./routes/api'));

app.get('/', (req, res) => res.send('MLM Node.js Backend Working'));

// Global Error Handler (Must be after routes)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

// Keep the process alive
setInterval(() => {
    // Heartbeat
}, 60000);

module.exports = app;
