// Validation utilities
exports.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

exports.validatePassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6
}

exports.sanitizeUserInput = (input) => {
    if (typeof input === 'string') {
        return input.trim()
    }
    return input
}
