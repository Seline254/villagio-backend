const { FarmerProfile } = require('../../models/farmerProfileDB')
const { User } = require('../../models/userDB')

// Create or update farmer profile
exports.createOrUpdateFarmerProfile = async (req, res) => {
    try {
        const farmerId = req.user.userId
        const { farmName, businessName, farmLocation, farmSize, categoriesDealtWith, aboutFarm } = req.body

        // Check if user is a farmer
        const user = await User.findById(farmerId)
        if (!user || user.userType !== 'farmer') {
            return res.status(403).json({ message: 'Only farmers can manage farm profiles' })
        }

        // Validate required fields
        if (!farmName || !farmLocation || !farmSize || !categoriesDealtWith || !aboutFarm) {
            return res.status(400).json({ message: 'All required fields must be provided' })
        }

        // Check if profile exists
        let profile = await FarmerProfile.findOne({ farmer: farmerId })

        if (profile) {
            // Update existing
            profile.farmName = farmName
            profile.businessName = businessName
            profile.farmLocation = farmLocation
            profile.farmSize = farmSize
            profile.categoriesDealtWith = categoriesDealtWith
            profile.aboutFarm = aboutFarm
            profile.updatedAt = Date.now()
            await profile.save()
            res.status(200).json({ message: 'Farmer profile updated successfully', profile })
        } else {
            // Create new
            const newProfile = new FarmerProfile({
                farmer: farmerId,
                farmName,
                businessName,
                farmLocation,
                farmSize,
                categoriesDealtWith,
                aboutFarm
            })
            await newProfile.save()
            res.status(201).json({ message: 'Farmer profile created successfully', profile: newProfile })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Get farmer profile
exports.getFarmerProfile = async (req, res) => {
    try {
        const farmerId = req.params.id || req.user.userId

        const profile = await FarmerProfile.findOne({ farmer: farmerId }).populate('farmer', 'name email')

        if (!profile) {
            return res.status(404).json({ message: 'Farmer profile not found' })
        }

        // Only the farmer themselves or admin can view
        if (req.user.userId !== farmerId && req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Access denied' })
        }

        res.status(200).json(profile)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Get all farmer profiles (for consumers/admins)
exports.getAllFarmerProfiles = async (req, res) => {
    try {
        const profiles = await FarmerProfile.find().populate('farmer', 'name email')
        res.status(200).json(profiles)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}