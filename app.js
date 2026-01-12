const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static('uploads'))

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/villagio')
        console.log('MongoDB connected successfully')
    } catch (error) {
        console.error('MongoDB connection failed:', error.message)
        process.exit(1)
    }
}

connectDB()

// Import routes
const authRoutes = require('./src/modules/auth/authRoutes')
const userRoutes = require('./src/modules/users/userRoutes')
const productRoutes = require('./src/modules/products/productRoutes')
const orderRoutes = require('./src/modules/orders/orderRoutes')
const notificationRoutes = require('./src/modules/notifications/notificationRoutes')
const farmerProfileRoutes = require('./src/modules/farmers/farmerProfileRoutes')
const dashboardRoutes = require('./src/modules/dashboard/dashboardRoutes')

// Error handler middleware
const errorHandler = require('./src/middleware/errorHandler')

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/farmers', farmerProfileRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Backend is running' })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app
