const express = require('express')
const productController = require('./productController')
const authMiddleware = require('../../middleware/authMiddleware')

const router = express.Router()

router.post('/', authMiddleware, productController.uploadProductImages, productController.addProduct)
router.get('/', productController.getAllProducts)
router.get('/search', productController.searchProducts)
router.get('/:id', productController.getProductById)
router.put('/:id', authMiddleware, productController.updateProduct)
router.delete('/:id', authMiddleware, productController.deleteProduct)

module.exports = router
