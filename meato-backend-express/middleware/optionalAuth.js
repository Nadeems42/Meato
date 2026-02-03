const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        // No token, proceed as guest
        return next();
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(verified.id);
        // If user not found (deleted?), could either error or proceed as guest. 
        // Proceeding as guest might be safer/smoother for checkout, but let's stick to auth logic:
        // If token is valid but user gone, it's an edge case. 
        next();
    } catch (err) {
        // Invalid token. 
        // We could block (400) or ignore and treat as guest.
        // For security, if they TRIED to send a token and it failed, we should probably warn them?
        // But for "Guest Checkout" usually if auth fails we just treat as guest.
        // However, if the frontend assumes they are logged in, this might be confusing.
        // Let's assume invalid token = guest for now, or just ignore the error.
        next();
    }
};
