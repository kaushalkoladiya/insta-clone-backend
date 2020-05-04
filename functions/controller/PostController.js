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

    res.json({ result: posts });
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
      userId: req.userId,
      createdAt: new Date().toISOString()
    }

    const doc = await db.collection('posts').add(post);

    res.json({ message: `Created with ${doc.id} successfully.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}