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

// Triggers
exports.LikeNotifiction = functions
  .region('asia-east2')
  .firestore
  .document('likes/{id}')
  .onCreate(async snapshot => {
    try {
      const doc = await db.doc(`/posts/${snapshot.data().postId}`).get();
      if (doc.exists && doc.data().username !== snapshot.data().username) {
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
      if (doc.exists && doc.data().username !== snapshot.data().username) {
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

// Update profile in each post
exports.OnUpdateProfilePicture = functions
  .region('asia-east2')
  .firestore
  .document('users/{userId}')
  .onUpdate(async change => {
    try {
      if (change.before.data().imageUrl === change.after.data().imageUrl) return true;
      const batch = db.batch();

      const posts = await db.collection('posts').where('username', '==', change.before.data().username).get();
      posts.forEach(doc => {
        const postRef = db.doc(`/posts/${doc.id}`);
        batch.update(postRef, { imageUrl: change.after.data().imageUrl });
      });
      await batch.commit();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  });

// Delete from everywhere
exports.OnDeletePost = functions
  .region('asia-east2')
  .firestore
  .document('posts/{postId}')
  .onDelete(async (snapshot, context) => {
    try {
      const postId = context.params.postId;
      const batch = db.batch();

      const comments = await db.collection('comments').where('postId', '==', postId).get();
      comments.forEach(doc => {
        batch.delete(db.doc(`/comments/${doc.id}`));
      });

      const likes = await db.collection('likes').where('postId', '==', postId).get();
      likes.forEach(doc => {
        batch.delete(db.doc(`/likes/${doc.id}`));
      });

      const notifications = await db.collection('notifications').where('postId', '==', postId).get();
      notifications.forEach(doc => {
        batch.delete(db.doc(`/notifications/${doc.id}`));
      });
      await batch.commit();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  });
