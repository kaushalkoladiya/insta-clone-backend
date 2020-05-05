const express = require('express');
const { body } = require('express-validator/check');

const AuthMiddleware = require('../middleware/AuthMiddleware');
const CommentController = require('../controller/CommentController');

const router = express.Router();

router.post('/:postId/store', AuthMiddleware, [
  body('body').isString().trim().notEmpty(),
], CommentController.store);

module.exports = router;