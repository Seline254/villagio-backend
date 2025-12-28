const express = require('express')
const userController = require('./userController')
const authMiddleware = require('../../middleware/authMiddleware')

const router = express.Router()

router.get('/profile', authMiddleware, userController.getUserProfile)
router.put('/profile', authMiddleware, userController.updateUserProfile)
router.get('/', authMiddleware, userController.getAllUsers)
router.delete('/:id', authMiddleware, userController.deleteUser)

module.exports = router
