const { Order, User, Product, Category, OrderItem, Shop } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        const { role, shop_id, franchise_id, id: userId } = req.user;
        const currentShopId = shop_id || franchise_id;
        let whereClause = {};

        // Scope data based on role
        if (role === 'shop_admin') {
            // Find the shop owned by this user
            const shop = await Shop.findOne({ where: { owner_id: userId } });
            if (shop) {
                whereClause = { franchise_id: shop.id };
            } else {
                // Return empty if no shop linked
                return res.json({ stats: {}, recentOrders: [], topCategories: [], charts: {} });
            }
        }

        const orderCount = await Order.count({ where: whereClause });
        const userCount = await User.count({ where: { role: 'user' } }); // Global customer count
        const productCount = await Product.count();
        const totalRevenue = await Order.sum('total', { where: whereClause }) || 0;

        const recentOrdersRaw = await Order.findAll({
            where: whereClause,
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['name'] }]
        });

        const recentOrders = recentOrdersRaw.map(o => ({
            id: o.id,
            customer: o.user ? o.user.name : 'Unknown',
            date: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A',
            amount: `₹${o.total}`,
            status: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : 'Pending'
        }));

        // Get status distribution
        const statusCounts = await Order.findAll({
            where: whereClause,
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('Order.id')), 'count']],
            group: ['status']
        });

        const orderStatus = [
            { name: 'Pending', value: 0 },
            { name: 'Processing', value: 0 },
            { name: 'Delivered', value: 0 },
            { name: 'Completed', value: 0 },
            { name: 'Cancelled', value: 0 }
        ];

        statusCounts.forEach(s => {
            const status = s.status.charAt(0).toUpperCase() + s.status.slice(1);
            const index = orderStatus.findIndex(os => os.name === status);
            if (index !== -1) orderStatus[index].value = parseInt(s.get('count'));
        });

        // Top Categories (by order items)
        const topCategoriesRaw = await OrderItem.findAll({
            attributes: [
                [sequelize.literal('`product->category`.`name`'), 'category_name'],
                [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'order_count']
            ],
            include: [{
                model: Product,
                as: 'product',
                attributes: [],
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: [],
                    where: whereClause.franchise_id ? {} : {} // No direct link from Category to Shop in this schema
                }]
            }],
            where: currentShopId ? { '$product.franchise_id$': currentShopId } : {},
            group: [sequelize.literal('`product->category`.`id`')],
            order: [[sequelize.literal('order_count'), 'DESC']],
            limit: 5
        });

        const topCategories = [];

        // Revenue Trend (Last 7 days/segments)
        const revenueTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - (i));
            revenueTrend.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                revenue: 0 // Mocking trend for now, real query would group by date
            });
        }
        revenueTrend[revenueTrend.length - 1].revenue = Number(totalRevenue);

        // EXTRA FOR SUPER ADMIN: Shop-wise sales
        let shopSales = [];
        if (role === 'super_admin' || role === 'admin') {
            shopSales = await Order.findAll({
                attributes: [
                    'franchise_id',
                    [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
                    [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orders']
                ],
                include: [{ model: Shop, as: 'shop', attributes: ['name'] }],
                group: ['franchise_id'],
                order: [[sequelize.literal('revenue'), 'DESC']]
            });
        }

        // Low Stock Alerts (Stock < 10) - Shop/Franchise Level
        const lowStockItems = await Product.findAll({
            where: {
                ...whereClause, // Respect shop filtering
                stock: { [Op.lt]: 10 }
            },
            attributes: ['id', 'name', 'stock', 'image'],
            limit: 5,
            order: [['stock', 'ASC']]
        });

        res.json({
            stats: {
                revenue: { value: `₹${Number(totalRevenue).toFixed(2)}`, label: role === 'shop_admin' ? 'Shop Revenue' : 'Total Revenue' },
                orders: { value: orderCount.toString(), label: 'Orders' },
                customers: { value: userCount.toString(), label: 'Total Customers' },
                products: { value: productCount.toString(), label: 'Global Products' },
                cod_total: { value: `₹${Number(totalRevenue).toFixed(2)}`, label: 'COD Collected' } // Phase 1: All are COD
            },
            recentOrders,
            topCategories,
            lowStockItems, // Added to response
            shopSales,
            charts: {
                revenueTrend,
                orderStatus,
            }
        });
    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).json({ error: err.message });
    }
};
