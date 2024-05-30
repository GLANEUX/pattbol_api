const express = require('express');
const router = express.Router();
const userController = require('../controllers/UsersController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');


router
.route('/create')
.post(userController.create);

router
.route('/login')
.post(userController.login);

router
    .route('/')
    .get(jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, userController.getAll)

router
    .route('/:id')
    .get(userController.get)

module.exports = router;