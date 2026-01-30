const mongoose = require('mongoose')
const {User} = require('./userDB')

const farmerProfileSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    farmName: {
        type: String,
        required: true
    },
    farmImage: {
        type: String,
        default: ''
    },
    businessName: {
        type: String
    },
    farmLocation: {
        type: String,
        required: true
    },
    farmSize: {
        type: String, // e.g., '5 acres'
        required: true
    },
    categoriesDealtWith: {
        type: [String],
        enum: ['Vegetables', 'Fruits', 'Dairy and Eggs', 'Herbs and Spices', 'Grains and Cereals'],
        required: true
    },
    aboutFarm: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = {
    FarmerProfile: mongoose.model('FarmerProfile', farmerProfileSchema)
}