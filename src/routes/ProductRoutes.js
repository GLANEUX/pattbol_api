// route.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductsController');
const multer = require('multer');


// Configuration de multer pour stocker temporairement les fichiers
const upload = multer({ storage: multer.memoryStorage() });


router.post('/create', upload.any('file'), productController.createProduct);

module.exports = router;
