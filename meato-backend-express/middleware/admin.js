module.exports = (req, res, next) => {
    if (req.user && ['admin', 'super_admin', 'shop_admin'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Authorized personnel only.' });
    }
};
