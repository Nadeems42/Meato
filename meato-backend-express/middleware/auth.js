const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // Debug log
    if (!token && !req.path.includes('/login') && !req.path.includes('/register')) {
        console.log(`[Auth Middleware] Access Denied for path: ${req.path}`);
    }
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(verified.id);
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};
