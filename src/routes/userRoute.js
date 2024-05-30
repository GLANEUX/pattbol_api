const express = require('express');
const router = express.Router();
const userController = require('../controllers/UsersController');


router
.route('/create')
.post(userController.create);


router
    .route('/')
    .get(userController.getAll)

router
    .route('/:id')
    .get(userController.get)

module.exports = router;