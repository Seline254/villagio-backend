const express = require('express');
const router = express.Router();
const orderController = require('../src/modules/orders/orderController');

// POST /api/orders
router.post('/', orderController.createOrder);

// GET /api/orders
router.get('/', orderController.getUserOrders);

// GET /api/orders/:id
router.get('/:id', orderController.getOrderById);

module.exports = router;