const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const addressController = require('../controllers/addressController');
const settingController = require('../controllers/settingController');
const dashboardController = require('../controllers/dashboardController');
const deliveryZoneController = require('../controllers/deliveryZoneController');
const categoryController = require('../controllers/categoryController');
const shopController = require('../controllers/shopController');

// Helper to stub missing controllers
const dummy = (req, res) => res.json({ message: 'Not Implemented Yet' });

const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');
const delivery = require('../middleware/delivery');
const optionalAuth = require('../middleware/optionalAuth');

const { Category, DeliveryZone } = require('../models');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validations/auth');
const { orderSchema, adminOrderUpdateSchema } = require('../validations/order');
const { productSchema } = require('../validations/product');

// --- Public Routes ---

// Auth
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);


// Catalog
router.get('/categories', categoryController.index);

router.get('/products', productController.index);
router.get('/products/:id', productController.show);

// Delivery Zones
router.get('/delivery-zones', deliveryZoneController.index);
router.post('/check-delivery-zone', deliveryZoneController.checkPincode);

// Hero & Settings
router.get('/hero', settingController.getHero);
router.get('/settings', settingController.getSettings);

// Shops (Public)
router.get('/shops', shopController.index);
router.get('/shops/nearest', shopController.findNearest);
router.get('/shops/:id', shopController.show);

// Legacy/Compatibility
router.get('/franchises', shopController.index);
router.get('/franchises/nearest', shopController.findNearest);
router.get('/franchises/:id', shopController.show);


// Orders (Guest or User)
router.post('/orders', optionalAuth, validate(orderSchema), orderController.store);
router.get('/orders/track/:id', orderController.trackOrder);

// --- Protected Routes (User) ---
router.use(auth); // Apply auth middleware to all below

router.post('/logout', authController.logout);
router.get('/user', authController.me);
router.put('/user/profile', authController.updateProfile);


// Cart
router.get('/cart', cartController.index);
router.post('/cart', cartController.store);
router.delete('/cart/:productId', cartController.destroy);
router.post('/cart/clear', cartController.clear);

// Orders
router.get('/orders', orderController.index);
router.get('/orders/:id', orderController.show);

// Addresses
router.get('/addresses', addressController.index);
router.post('/addresses', addressController.store);
router.get('/addresses/:id', addressController.show);
router.put('/addresses/:id', addressController.update);
router.delete('/addresses/:id', addressController.destroy);


// --- Delivery Person Routes ---
router.get('/delivery/orders', delivery, orderController.getDeliveryOrders);
router.put('/delivery/orders/:id/accept', delivery, orderController.acceptOrder);
router.put('/delivery/orders/:id/reject', delivery, orderController.rejectOrder);
router.put('/delivery/orders/:id/out-for-delivery', delivery, orderController.markAsOutForDelivery);
router.put('/delivery/orders/:id/reached', delivery, orderController.markAsReached);
router.put('/delivery/orders/:id/collect-cash', delivery, orderController.collectCash);
router.put('/delivery/orders/:id/deliver', delivery, orderController.markAsDelivered);
router.put('/delivery/availability', delivery, authController.toggleAvailability);


// --- Admin Routes ---
router.use(admin); // Apply admin check to all below

// Dashboard
router.get('/admin/dashboard', dashboardController.index);
router.get('/dashboard', dashboardController.index); // alias

// Super Admin/Admin: Manage Admins & Delivery Personnel
router.get('/admin/admins', authController.getAdmins);
router.post('/admin/create-shop-admin', superAdmin, authController.createShopAdmin);
router.delete('/admin/admins/:id', superAdmin, authController.deleteAdmin);

router.get('/admin/delivery-persons', authController.getDeliveryPersons);
router.get('/admin/shop-delivery-persons', authController.getShopDeliveryPersonnel);
router.get('/admin/franchise-delivery-persons', authController.getShopDeliveryPersonnel); // legacy
router.post('/admin/create-delivery-partner', authController.createDeliveryPartner);

router.get('/admin/customers', authController.getCustomers);


// Admin Orders
router.get('/admin/orders', orderController.adminIndex);
router.put('/admin/orders/:id', validate(adminOrderUpdateSchema), orderController.adminUpdate);
router.put('/admin/orders/:id/assign', orderController.assignDeliveryPerson);

// Admin Catalog Management
router.post('/categories', admin, upload.single('image'), categoryController.store);
router.put('/categories/:id', admin, upload.single('image'), categoryController.update);
router.put('/categories/:id/approve', superAdmin, categoryController.approve);
router.delete('/categories/:id', superAdmin, categoryController.destroy);

// Products
router.post('/products', admin, upload.single('image'), validate(productSchema), productController.store);
router.put('/products/:id', admin, upload.single('image'), validate(productSchema), productController.update);
router.put('/products/:id/approve', superAdmin, productController.approve);
router.delete('/products/:id', superAdmin, productController.destroy);

// Admin Delivery Zones Management
router.get('/admin/delivery-zones', deliveryZoneController.adminIndex);
router.get('/admin/my-delivery-zones', deliveryZoneController.shopIndex); // New endpoint for Shop Admins
router.post('/admin/delivery-zones', deliveryZoneController.store);
router.put('/admin/delivery-zones/:id', deliveryZoneController.update);
router.put('/admin/delivery-zones/:id/approve', superAdmin, deliveryZoneController.approveZone);
router.delete('/admin/delivery-zones/:id', deliveryZoneController.destroy);

// Hero Settings
router.post('/hero', upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'backgroundImageFile', maxCount: 1 }
]), settingController.updateHero);
router.post('/settings', settingController.updateSettings);

// Admin Shop Management
router.post('/shops', shopController.store);
router.put('/shops/:id', shopController.update);
router.delete('/shops/:id', shopController.destroy);
// legacy
router.post('/franchises', shopController.store);
router.put('/franchises/:id', shopController.update);
router.delete('/franchises/:id', shopController.destroy);

// Shop Inventory Management
router.get('/shops/:id/inventory', shopController.getInventory);
router.put('/shops/:franchiseId/inventory/:productId', shopController.updateInventoryItem);
// legacy
router.get('/franchises/:id/inventory', shopController.getInventory);
router.put('/franchises/:franchiseId/inventory/:productId', shopController.updateInventoryItem);


module.exports = router;
