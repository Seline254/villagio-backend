const { User } = require('../../models/userDB')
const { Product } = require('../../models/productDB')
const { Order } = require('../../models/orderDB')
const { FarmerProfile } = require('../../models/farmerProfileDB')

// Admin Dashboard
exports.getAdminDashboard = async (req, res) => {
    try {
        // Total users grouped by role
        const userStats = await User.aggregate([
            { $group: { _id: '$userType', count: { $sum: 1 } } }
        ])

        const totalUsersByRole = {}
        userStats.forEach(stat => {
            totalUsersByRole[stat._id] = stat.count
        })

        // Individual counts
        const totalFarmers = totalUsersByRole.farmer || 0
        const totalVendors = totalUsersByRole.vendor || 0
        const totalConsumers = totalUsersByRole.consumer || 0

        // Total products
        const totalProducts = await Product.countDocuments()

        // Total orders
        const totalOrders = await Order.countDocuments()

        // Total revenue (sum of completed orders)
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

        res.status(200).json({
            totalUsersByRole,
            totalFarmers,
            totalVendors,
            totalConsumers,
            totalProducts,
            totalOrders,
            totalRevenue
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Farmer Dashboard
exports.getFarmerDashboard = async (req, res) => {
    try {
        const farmerId = req.user.userId

        // Farmer profile summary
        const profile = await FarmerProfile.findOne({ farmer: farmerId })

        // Number of products
        const productCount = await Product.countDocuments({ farmer: farmerId })

        // Orders containing farmer's products
        const farmerProducts = await Product.find({ farmer: farmerId }).distinct('_id')
        const orders = await Order.find({ 'items.product': { $in: farmerProducts } })
            .populate('consumer', 'name')
            .populate('items.product', 'name')
            .sort({ createdAt: -1 })

        // Total earnings from completed orders
        const earningsResult = await Order.aggregate([
            { $match: { paymentStatus: 'completed', 'items.product': { $in: farmerProducts } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
        const totalEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0

        // Categories
        const categories = profile ? profile.categoriesDealtWith : []

        res.status(200).json({
            profile,
            productCount,
            orders,
            totalEarnings,
            categories
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Vendor Dashboard
exports.getVendorDashboard = async (req, res) => {
    try {
        const vendorId = req.user.userId

        // Vendor profile summary (assuming vendor has user profile)
        const profile = await User.findById(vendorId).select('-password')

        // Total orders placed
        const totalOrders = await Order.countDocuments({ consumer: vendorId })

        // Total amount spent
        const spentResult = await Order.aggregate([
            { $match: { consumer: vendorId, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
        const totalSpent = spentResult.length > 0 ? spentResult[0].total : 0

        // Order statuses breakdown
        const statusBreakdown = await Order.aggregate([
            { $match: { consumer: vendorId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])

        const orderStatuses = {}
        statusBreakdown.forEach(stat => {
            orderStatuses[stat._id] = stat.count
        })

        // Preferred payment methods
        const paymentMethods = await Order.aggregate([
            { $match: { consumer: vendorId } },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])

        res.status(200).json({
            profile,
            totalOrders,
            totalSpent,
            orderStatuses,
            preferredPaymentMethods: paymentMethods
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Consumer Dashboard
exports.getConsumerDashboard = async (req, res) => {
    try {
        const consumerId = req.user.userId

        // Total orders placed
        const totalOrders = await Order.countDocuments({ consumer: consumerId })

        // Recent orders (last 10)
        const recentOrders = await Order.find({ consumer: consumerId })
            .populate('items.product', 'name category')
            .sort({ createdAt: -1 })
            .limit(10)

        // Total amount spent
        const spentResult = await Order.aggregate([
            { $match: { consumer: consumerId, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
        const totalSpent = spentResult.length > 0 ? spentResult[0].total : 0

        // Most purchased categories
        const categoryStats = await Order.aggregate([
            { $match: { consumer: consumerId } },
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $group: { _id: '$product.category', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ])

        res.status(200).json({
            totalOrders,
            recentOrders,
            totalSpent,
            mostPurchasedCategories: categoryStats
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}