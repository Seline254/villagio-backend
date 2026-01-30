const express = require('express')
const notificationController = require('./notificationController')
const { authMiddleware, roleMiddleware } = require('../../middleware/authMiddleware')
const router = express.Router()

router.get('/', authMiddleware, notificationController.getUserNotifications)
router.put('/:id/read', authMiddleware, notificationController.markAsRead)
router.delete('/:id', authMiddleware, notificationController.deleteNotification)

module.exports = router
