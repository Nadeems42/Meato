module.exports = (req, res, next) => {
    if (req.user && req.user.role === 'delivery_person') {
        next();
    } else {
        res.status(403).json({ message: 'Delivery person access required' });
    }
};
