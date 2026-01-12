const express = require('express')
const farmerProfileController = require('./farmerProfileController')
const { authMiddleware, roleMiddleware } = require('../../middleware/authMiddleware')

const router = express.Router()

// Farmers can create/update their own profile
router.post('/profile', authMiddleware, roleMiddleware(['farmer']), farmerProfileController.createOrUpdateFarmerProfile)

// Get own profile (farmers) or specific profile (admin)
router.get('/profile/:id?', authMiddleware, farmerProfileController.getFarmerProfile)

// Get all profiles (for consumers/admins to browse)
router.get('/', authMiddleware, farmerProfileController.getAllFarmerProfiles)

module.exports = router