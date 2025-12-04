// Success response formatter
exports.successResponse = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    })
}

// Error response formatter
exports.errorResponse = (res, message = 'Error', statusCode = 500, error = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error : null
    })
}
