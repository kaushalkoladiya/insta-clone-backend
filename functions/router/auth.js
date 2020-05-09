const express = require('express');
const { body } = require('express-validator/check');

const AuthController = require('../controller/AuthController');

const router = express.Router();

router.post('/signup', [
  body('username').isString().isLength({ min: 2, max: 20 }).trim().notEmpty().withMessage('Invalid Username.'),
  body('email').isEmail().trim().notEmpty().withMessage('Invalid Email.'),
  body('password').isString().isLength({ min: 5, max: 50 }).trim().notEmpty().withMessage('Password should be minimum 5 characters.'),
  body('confirmPassword').custom((value, { req }) => (value !== req.body.password) ? false : true).withMessage('Password does not match'),
], AuthController.signup);

router.post('/login', [
  body('email').trim().isString().notEmpty().withMessage('Email is required!'),
  body('password').trim().isString().notEmpty().withMessage('Pasword is required!'),
], AuthController.login);

module.exports = router;