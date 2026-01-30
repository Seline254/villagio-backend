const path = require('path');
const fs = require('fs');
const { FarmerProfile } = require('../../models/farmerProfileDB');
const {User}  = require('../../models/userDB');

exports.createOrUpdateFarmerProfile = async (req, res) => {
    try {
        const farmerId = req.user.userId;
        console.log(farmerId)
        const { farmName, businessName, farmLocation, farmSize, categoriesDealtWith, aboutFarm } = req.body;

        // 1. Image Handling
        let farmImage = null;
        if (req.file) {
            const ext = path.extname(req.file.originalname); 
            const newFilename = Date.now() + ext;
            const newPath = path.join("uploads", newFilename);
            
            // Move file from temporary multer destination to our uploads folder
            fs.renameSync(req.file.path, newPath);
            
            // Clean the path for the database (convert backslashes to forward slashes)
            farmImage = newPath.replace(/\\/g, "/");
        }

        // 2. Profile Logic
        const profile = await FarmerProfile.findOne({ farmer: farmerId });

        if (profile) {
            // Update
            profile.farmName = farmName;
            profile.businessName = businessName;
            profile.farmLocation = farmLocation;
            profile.farmSize = farmSize;
            profile.categoriesDealtWith = categoriesDealtWith;
            profile.aboutFarm = aboutFarm;
            
            // Only update the photo if a new one was uploaded
            if (farmImage) {
                profile.farmImage = farmImage;
            }

            profile.updatedAt = Date.now();
            await profile.save();
            res.status(200).json({ message: 'Updated successfully', profile });
        } else {
            // Create
            const newProfile = new FarmerProfile({
                farmer: farmerId,
                farmName,
                businessName,
                farmLocation,
                farmSize,
                categoriesDealtWith,
                aboutFarm,
                farmImage // Save the processed path
            });
            await newProfile.save();
            res.status(201).json({ message: 'Created successfully', profile: newProfile });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get farmer profile
exports.getFarmerProfile = async (req, res) => {
    try {
        const farmerId = req.params.id || req.user.userId

        const profile = await FarmerProfile.findOne({ farmer: farmerId }).populate('farmer', 'name email')

        if (!profile) {
            return res.status(200).json({ message: 'No profile created yet' })
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