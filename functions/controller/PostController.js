const { validationResult } = require('express-validator');
const { db } = require('../db.config');

exports.index = async (req, res, next) => {
  try {
    const data = await db.collection('posts').orderBy('createdAt', 'desc').get();
    let posts = [];
    data.forEach(doc => {
      posts.push({
        postId: doc.id,
        userId: doc.data().userId,
        body: doc.data().body,
        createdAt: doc.data().createdAt,
      });
    });

    return res.json({ result: posts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.store = async (req, res, next) => {
  try {
    const validatedData = validationResult(req);
    if (!validatedData.isEmpty()) {
      res.status(400).json({ validation: validatedData.errors });
    }
    const post = {
      body: req.body.body,
      username: req.user.username,
      createdAt: new Date().toISOString(),
      imageUrl: req.user.imageUrl,
      likeCount: 0,
      commentCount: 0,
    }

    const doc = await db.collection('posts').add(post);
    post.postId = doc.id;

    return res.json({ post });
  } catch (error) {
    return res.status(500).json({ error });
  }
}

exports.show = async (req, res, next) => {
  try {
    let post = {};
    const doc = await db.doc(`/posts/${req.params.postId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Not found" });
    }
    post = doc.data();
    post.postId = doc.id;

    const data = await db.collection('comments').orderBy('createdAt', 'desc').where('postId', '==', req.params.postId).get();
    post.comments = [];
    data.forEach(doc => {
      post.comments.push(doc.data())
    });
    return res.status(200).json({ post });
  } catch (error) {
    return res.status(500).json({ error });
  }
}

exports.destroy = async (req, res, next) => {
  try {
    const document = db.doc(`/posts/${req.params.postId}`);

    const doc = await document.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Not found." });
    }
    if (doc.data().username !== req.user.username) {
      return res.status(403).json({ error: "Action forbidden." });
    }
    await document.delete();

    return res.status(200).json({ message: "Delete Successfully." });

  } catch (error) {
    return res.status(500).json({ error });
  }
}