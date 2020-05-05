const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');

const { db } = require('./db.config');

const authRouter = require('./router/auth');
const postRouter = require('./router/post');
const userRouter = require('./router/user');
const commentRouter = require('./router/comment');
const likeRouter = require('./router/like');
const notificationRouter = require('./router/notification');

const app = express();

app.use(bodyParser.json());
app.use(authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use('/comment', commentRouter);
app.use('/like', likeRouter);
app.use('/notification', notificationRouter);

exports.api = functions.region('asia-east2').https.onRequest(app);

exports.LikeNotifiction = functions
  .region('asia-east2')
  .firestore
  .document('likes/{id}')
  .onCreate(async snapshot => {
    try {
      const doc = await db.doc(`/posts/${snapshot.data().postId}`).get();
      if (doc.exists) {
        await db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          postId: doc.id,
          recipient: doc.data().username,
          sender: snapshot.data().username,
          read: false,
          type: 'like'
        });
        return;
      }
    } catch (error) {
      console.error(error);
      return;
    }
  });

// Delete notification when unlike the post
exports.Unlike = functions
  .region('asia-east2')
  .firestore
  .document('likes/{id}')
  .onDelete(async snapshot => {
    try {
      await db.doc(`/notifications/${snapshot.id}`).delete();
      return;
    } catch (error) {
      console.error(error);
      return
    }
  });

exports.CommentNotifiction = functions
  .region('asia-east2')
  .firestore
  .document('comments/{id}')
  .onCreate(async snapshot => {
    try {
      const doc = await db.doc(`/posts/${snapshot.data().postId}`).get();
      if (doc.exists) {
        await db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          postId: doc.id,
          recipient: doc.data().username,
          sender: snapshot.data().username,
          read: false,
          type: 'comment'
        });
        return;
      }
    } catch (error) {
      console.error(error);
      return;
    }
  });