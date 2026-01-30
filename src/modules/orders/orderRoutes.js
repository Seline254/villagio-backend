const express = require('express')
const orderController = require('./orderController')
const { authMiddleware, roleMiddleware } = require('../../middleware/authMiddleware')


const router = express.Router()

router.post('/', authMiddleware, orderController.createOrder)
router.get('/user', authMiddleware, orderController.getUserOrders)
router.get('/:id', authMiddleware, orderController.getOrderById)
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus)
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder)

module.exports = router
