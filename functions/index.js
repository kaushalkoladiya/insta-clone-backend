const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');

const authRouter = require('./router/auth');
const postRouter = require('./router/post');
const userRouter = require('./router/user');
const commentRouter = require('./router/comment');
const likeRouter = require('./router/like');

const app = express();

app.use(bodyParser.json());
app.use(authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use('/comment', commentRouter);
app.use('/like', likeRouter);

exports.api = functions.region('asia-east2').https.onRequest(app);