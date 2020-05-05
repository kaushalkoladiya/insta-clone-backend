const express = require('express');

const AuthMiddleware = require('../middleware/AuthMiddleware');
const NotificationController = require('../controller/NotificationController');

const router = express.Router();

router.post('/', AuthMiddleware, NotificationController.markAsRead);

module.exports = router;