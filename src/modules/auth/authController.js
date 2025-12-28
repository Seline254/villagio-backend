const { User } = require('../../models/userDB')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// User Registration
exports.register = async (req, res) => {
    try {
        const { email, password, name, userType } = req.body

        // Validate input
        if (!email || !password || !name || !userType) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            userType
        })

        const savedUser = await newUser.save()

        // Generate JWT token
        const token = jwt.sign(
            { userId: savedUser._id, email: savedUser.email, userType: savedUser.userType },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: savedUser._id,
                email: savedUser.email,
                name: savedUser.name,
                userType: savedUser.userType
            },
            token
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        // Find user
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                userType: user.userType
            },
            token
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
