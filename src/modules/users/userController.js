const { User } = require('../../models/userDB')

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { name, phone, address },
            { new: true }
        ).select('-password')

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password')

        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id)

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
