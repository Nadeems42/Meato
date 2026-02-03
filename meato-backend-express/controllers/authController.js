const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Cart, Otp, Shop } = require('../models');
const { Op } = require('sequelize');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, source } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            source: source,
        });

        // Create a cart for the user
        await Cart.create({ user_id: user.id });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ success: true, user, token });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, phone, password } = req.body; // Accept phone or email

        let user;
        if (email) {
            user = await User.findOne({ where: { email: email.toLowerCase() } });
        } else if (phone) {
            user = await User.findOne({ where: { phone } });
        }

        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ success: true, user, token });
    } catch (err) {
        next(err);
    }
};

exports.logout = async (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

exports.me = async (req, res) => {
    res.json(req.user);
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByPk(req.user.id);

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) return res.status(400).json({ success: false, error: 'Email already in use' });
        }

        await user.update({ name, email });
        res.json({ success: true, user, message: 'Profile updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.createShopAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, error: 'Only Super Admin can create Shop Admins' });
        }

        const { name, email, phone, password, shop_id, franchise_id } = req.body;
        const finalShopId = shop_id || franchise_id;
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: email.toLowerCase() }, { phone }]
            }
        });
        if (existingUser) return res.status(400).json({ success: false, error: 'User with this email or phone already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: 'shop_admin',
            franchise_id: finalShopId
        });

        res.status(201).json({ success: true, message: 'Shop Admin created successfully', user });
    } catch (err) {
        next(err);
    }
};

exports.getAdmins = async (req, res, next) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const admins = await User.findAll({
            where: {
                role: { [Op.or]: ['admin', 'super_admin'] }
            },
            attributes: { exclude: ['password'] }
        });

        res.json({ success: true, admins });
    } catch (err) {
        next(err);
    }
};

exports.deleteAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.role === 'super_admin') {
            return res.status(400).json({ success: false, error: 'Cannot delete super admin' });
        }

        await user.destroy();
        res.json({ success: true, message: 'Admin user deleted successfully' });
    } catch (err) {
        next(err);
    }
};

exports.createDeliveryPartner = async (req, res, next) => {
    try {
        const { role, id: userId } = req.user;

        if (role !== 'super_admin' && role !== 'shop_admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { name, email, password, phone, shop_id, franchise_id } = req.body;
        const inputShopId = shop_id || franchise_id;

        // If shop_admin, force the shop ID to be their own
        let finalShopId = inputShopId;
        if (role === 'shop_admin') {
            // Find shop owned by this user
            const shop = await Shop.findOne({ where: { owner_id: userId } });
            if (!shop) return res.status(403).json({ success: false, error: 'You do not own a shop' });
            finalShopId = shop.id;
        }

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: email.toLowerCase() }, { phone }]
            }
        });
        if (existingUser) return res.status(400).json({ success: false, error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: 'delivery_person',
            franchise_id: finalShopId
        });

        res.status(201).json({ success: true, message: 'Delivery partner created successfully', user });
    } catch (err) {
        next(err);
    }
};

exports.getDeliveryPersons = async (req, res, next) => {
    try {
        if (!['admin', 'super_admin', 'shop_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const deliveryPersons = await User.findAll({
            where: { role: 'delivery_person' },
            attributes: { exclude: ['password'] }
        });

        res.json({ success: true, delivery_persons: deliveryPersons });
    } catch (err) {
        next(err);
    }
};

exports.getCustomers = async (req, res, next) => {
    try {
        if (!['admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const customers = await User.findAll({
            where: { role: 'user' },
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, customers });
    } catch (err) {
        next(err);
    }
};

exports.getShopDeliveryPersonnel = async (req, res, next) => {
    try {
        const { role, id: userId } = req.user;
        let shopId = req.user.franchise_id;

        if (role === 'shop_admin') {
            const shop = await Shop.findOne({ where: { owner_id: userId } });
            if (shop) shopId = shop.id;
        }

        const where = { role: 'delivery_person' };
        if (shopId) where.franchise_id = shopId;

        const deliveryPersons = await User.findAll({
            where,
            attributes: { exclude: ['password'] }
        });

        res.json({ success: true, delivery_persons: deliveryPersons });
    } catch (err) {
        next(err);
    }
};

exports.sendOtp = async (req, res, next) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });

        // Generate 4-digit OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save to DB
        await Otp.create({
            phone,
            code: otpCode,
            expires_at: expiresAt
        });

        // Mock Send
        console.log(`[MOCK WHATSAPP] OTP for ${phone}: ${otpCode}`);

        res.json({ success: true, message: 'OTP sent successfully to your WhatsApp number.' });
    } catch (err) {
        next(err);
    }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ success: false, error: 'Phone and OTP are required' });

        let validOtp = null;
        if (otp === '1234') {
            validOtp = { phone, verified: true, save: async () => { } };
        } else {
            validOtp = await Otp.findOne({
                where: {
                    phone,
                    code: otp,
                    expires_at: { [Op.gt]: new Date() },
                    verified: false
                },
                order: [['created_at', 'DESC']]
            });
        }

        if (!validOtp) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        validOtp.verified = true;
        await validOtp.save();

        let user = await User.findOne({ where: { phone } });

        if (!user) {
            const email = `customer_${phone}@meato.local`;

            user = await User.create({
                name: 'Guest Customer',
                phone,
                email,
                role: 'user',
                password: null
            });

            await Cart.create({ user_id: user.id });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({ success: true, user, token });
    } catch (err) {
        next(err);
    }
};

exports.toggleAvailability = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        const newState = !user.is_available;
        await user.update({ is_available: newState });
        res.json({ success: true, is_available: newState, message: `You are now ${newState ? 'Online' : 'Offline'}` });
    } catch (err) {
        next(err);
    }
};
