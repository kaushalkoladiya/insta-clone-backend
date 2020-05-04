const express = require('express');
const { body } = require('express-validator/check');

const AuthMiddleware = require('../middleware/AuthMiddleware');
const PostController = require('../controller/PostController');

const router = express.Router();

router.get('/', PostController.index);
router.post('/', AuthMiddleware, [
  body('body').isString().isLength({ min: 10 }).trim().notEmpty(),
], PostController.store);


module.exports = router;