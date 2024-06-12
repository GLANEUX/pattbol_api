const express = require('express');
const router = express.Router();
const userController = require('../controllers/UsersController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post('/create', userController.create);
router.post('/login', userController.login);

router.get('/:id', jwtMiddleware.verifyToken, jwtMiddleware.GoodUser, userController.get)
router.get('/user/id', jwtMiddleware.verifyToken, userController.getUserIdFromToken);

//------------------------------------------------------//
router.patch('/:id', jwtMiddleware.verifyToken, jwtMiddleware.GoodUser, userController.modify)
router.patch('/modifyPassword/:id', jwtMiddleware.verifyToken, jwtMiddleware.GoodUser, userController.modifyPassword)

router.delete('/:id', jwtMiddleware.verifyToken, jwtMiddleware.GoodUser, userController.deleteUser )



module.exports = router;