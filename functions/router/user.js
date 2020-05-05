const express = require('express');
const { body } = require('express-validator/check');

const AuthMiddleware = require('../middleware/AuthMiddleware');
const UserController = require('../controller/UserController');

const router = express.Router();

router.post('/profile/image', AuthMiddleware, UserController.imageUpload);
router.post('/update', AuthMiddleware, [
  body('bio').isString().trim().withMessage('Bio is invalid'),
  body('location').isString().trim().withMessage('Invalid location'),
  body('website').isString().trim().withMessage('Invalid URL')
], UserController.update);
router.get('/', AuthMiddleware, UserController.userData);
router.get('/:username', UserController.show);


module.exports = router;