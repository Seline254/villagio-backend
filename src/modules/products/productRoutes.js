const express = require('express')
const productController = require('./productController')
const { authMiddleware, roleMiddleware } = require('../../middleware/authMiddleware')

const router = express.Router()

router.post('/', authMiddleware, roleMiddleware(['farmer']), productController.uploadProductImages, productController.addProduct)
router.get('/', productController.getAllProducts)
router.get('/search', productController.searchProducts)
router.get('/:id', productController.getProductById)
router.put('/:id', authMiddleware, roleMiddleware(['farmer']), productController.updateProduct)
router.delete('/:id', authMiddleware, roleMiddleware(['farmer']), productController.deleteProduct)

module.exports = router
