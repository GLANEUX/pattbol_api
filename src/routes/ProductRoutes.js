const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductsController');
const multer = require('multer');
const jwtMiddleware = require('../middlewares/jwtMiddleware');


// Configuration de multer pour stocker temporairement les fichiers
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create', upload.any('file'), productController.createProduct);

router.get('/search/:search', jwtMiddleware.verifyToken, productController.searchProduct);
router.get('/scan/:scan', jwtMiddleware.verifyToken, productController.scanProduct);
router.get('/categories', jwtMiddleware.verifyToken, productController.getCategories);
router.get('/category/:title', jwtMiddleware.verifyToken, productController.getProductsByCategory);
router.get('/get/:id', jwtMiddleware.verifyToken, productController.getProduct);
router.get('/history/:id', jwtMiddleware.verifyToken, jwtMiddleware.GoodUser, productController.getUserHistory);


module.exports = router;
