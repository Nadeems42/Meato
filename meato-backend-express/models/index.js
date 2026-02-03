const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const DeliveryZone = require('./DeliveryZone');
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Address = require('./Address');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Setting = require('./Setting');

// Define associations clearly here to avoid circular dependency issues during definition
const Shop = require('./Shop');
const ShopProduct = require('./ShopProduct');
const Otp = require('./Otp');

// User Associations
User.hasMany(Order, { foreignKey: 'user_id' });
User.hasMany(Address, { foreignKey: 'user_id' });
User.hasOne(Cart, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'delivery_person_id', as: 'deliveries' });

// SHOP - USER (Owner)
Shop.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// USER - SHOP (Staff/Admin of a shop)
User.belongsTo(Shop, { foreignKey: 'franchise_id', as: 'shop' });
Shop.hasMany(User, { foreignKey: 'franchise_id', as: 'staff' });

// SHOP - PRODUCTS (Inventory)
Shop.hasMany(ShopProduct, { foreignKey: 'franchise_id', as: 'inventory' });
ShopProduct.belongsTo(Shop, { foreignKey: 'franchise_id' });

Product.hasMany(ShopProduct, { foreignKey: 'product_id', as: 'shopProducts' });
ShopProduct.belongsTo(Product, { foreignKey: 'product_id' });

// SHOP - ORDERS
Order.belongsTo(Shop, { foreignKey: 'franchise_id', as: 'shop' });
Shop.hasMany(Order, { foreignKey: 'franchise_id' });


// Product/Category Associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id' });

// Product/Variant Associations
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

// Order Associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(User, { foreignKey: 'delivery_person_id', as: 'delivery_person' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Cart Associations
Cart.belongsTo(User, { foreignKey: 'user_id' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

const models = { Category, Product, ProductVariant, DeliveryZone, User, Order, OrderItem, Address, Cart, CartItem, Setting, Shop, ShopProduct, Otp };
module.exports = models;
