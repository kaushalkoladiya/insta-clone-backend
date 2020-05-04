const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');

const authRouter = require('./router/auth');
const postRouter = require('./router/post');

const app = express();

app.use(bodyParser.json());
app.use(authRouter);
app.use('/post', postRouter)

exports.api = functions.region('asia-east2').https.onRequest(app);