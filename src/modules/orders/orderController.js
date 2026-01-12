const { Order, OrderItem } = require('../../models/orderDB')
const { Product } = require('../../models/productDB')

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' })
        }

        // Assume all items from same farmer
        const firstProduct = await Product.findById(items[0].productId).populate('farmer', 'name')
        if (!firstProduct) {
            return res.status(400).json({ message: 'Invalid product' })
        }

        const vendor = firstProduct.farmer
        const vendorNameParts = vendor.name.split(' ')
        const vendorFirstName = vendorNameParts[0] || ''
        const vendorLastName = vendorNameParts.slice(1).join(' ') || ''

        let totalAmount = 0
        const orderItems = []

        for (const item of items) {
            totalAmount += item.price * item.quantity
            orderItems.push({
                product: item.productId,
                quantity: item.quantity,
                price: item.price
            })
        }

        const newOrder = new Order({
            consumer: req.user.userId,
            vendorFirstName,
            vendorLastName,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            paymentMethod,
            status: 'pending'
        })

        const savedOrder = await newOrder.save()
        await savedOrder.populate('consumer', 'name email phone')
        await savedOrder.populate('items.product', 'name price')

        res.status(201).json(savedOrder)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ consumer: req.user.userId })
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 })

        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('consumer', 'name email phone')
            .populate('items.product', 'name price')

        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        res.status(200).json(order)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' })
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('items.product', 'name price')

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' })
        }

        res.status(200).json(updatedOrder)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Can only cancel pending orders' })
        }

        order.status = 'cancelled'
        const updatedOrder = await order.save()

        res.status(200).json(updatedOrder)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
