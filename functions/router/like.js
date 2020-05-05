const express = require('express');

const AuthMiddleware = require('../middleware/AuthMiddleware');
const LikeController = require('../controller/LikeController');

const router = express.Router();

router.post('/:postId/store', AuthMiddleware, LikeController.store);
router.post('/:postId/delete', AuthMiddleware, LikeController.destroy);

module.exports = router;