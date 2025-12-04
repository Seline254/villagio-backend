const { Notification } = require('../../models/notificationDB')

// Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.userId })
            .sort({ createdAt: -1 })

        res.status(200).json(notifications)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        res.status(200).json(notification)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id)

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        res.status(200).json({ message: 'Notification deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Create notification
exports.createNotification = async (userId, title, message, type) => {
    try {
        const newNotification = new Notification({
            user: userId,
            title,
            message,
            type
        })

        await newNotification.save()
    } catch (error) {
        console.error('Error creating notification:', error.message)
    }
}
