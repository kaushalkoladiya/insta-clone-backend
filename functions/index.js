const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const serviceAccount = require('./credential.json');

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-12ee2.firebaseio.com"
});

app.get('/posts', (req, res, next) => {
  admin.firestore()
    .collection('posts')
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          url: doc.data().url,
          userId: doc.data().userId,
          body: doc.data().body,
          createdAt: doc.data().createdAt,
        });
      });
      console.log(posts);
      res.json({ result: posts });
    })
    .catch(err => console.error(err));
})

app.post('/post', (req, res, next) => {
  const post = {
    url: req.body.url,
    body: req.body.body,
    userId: req.body.userId,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  }

  admin.firestore()
    .collection('posts')
    .add(post)
    .then(doc => {
      res.json({ message: `Created with ${doc.id} successfully.` });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    });
})

exports.api = functions.https.onRequest(app);