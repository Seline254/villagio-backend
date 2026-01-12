const express = require('express')
const userController = require('./userController')
const { authMiddleware, roleMiddleware } = require('../../middleware/authMiddleware')

const router = express.Router()

router.get('/profile', authMiddleware, userController.getUserProfile)
router.put('/profile', authMiddleware, userController.updateUserProfile)
router.get('/', authMiddleware, roleMiddleware(['admin']), userController.getAllUsers)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), userController.deleteUser)

module.exports = router
