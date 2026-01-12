const { Product } = require('../../models/productDB')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const upload = multer({ dest: 'uploads/' })
exports.uploadProductImages = upload.array('images', 5)

// Add product
exports.addProduct = async (req, res) => {
    try {
        // Check if user is a farmer
        if (req.user.userType !== 'farmer') {
            return res.status(403).json({ message: 'Only farmers can add products' })
        }

        let images = []
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const ext = path.extname(file.originalname)
                const newFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext
                const newPath = path.join('uploads', newFileName)
                fs.renameSync(file.path, newPath)
                images.push(newPath.replace(/\\/g, '/'))
            }
        }

        const newProductData = {
            ...req.body,
            farmer: req.user.userId,
            images
        }

        const newProduct = new Product(newProductData)
        const savedProduct = await newProduct.save()

        res.status(201).json(savedProduct)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('farmer', 'name email phone')

        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('farmer', 'name email phone')

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        if (product.farmer.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only update your own products' })
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )

        res.status(200).json(updatedProduct)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        if (product.farmer.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete your own products' })
        }

        await Product.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Search and filter products
exports.searchProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query

        const filter = {}

        if (category) filter.category = category
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ]

        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = parseInt(minPrice)
            if (maxPrice) filter.price.$lte = parseInt(maxPrice)
        }

        const results = await Product.find(filter).populate('farmer', 'name email')

        res.status(200).json(results)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
