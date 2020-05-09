const express = require('express');
const { body } = require('express-validator/check');

const AuthMiddleware = require('../middleware/AuthMiddleware');
const PostController = require('../controller/PostController');

const router = express.Router();

router.get('/', PostController.index);
router.post('/', AuthMiddleware, [
  // body('body').isString().trim().notEmpty(),
], PostController.store);
router.get('/:postId', PostController.show);
router.delete('/:postId', AuthMiddleware, PostController.destroy);

module.exports = router;