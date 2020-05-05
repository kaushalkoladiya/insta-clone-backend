const { validationResult } = require('express-validator');
const { db } = require('../db.config');

exports.store = async (req, res, next) => {
  try {
    const validatedData = validationResult(req);
    if (!validatedData.isEmpty()) {
      res.status(400).json({ validation: validatedData.errors });
    }

    const doc = await db.doc(`/posts/${req.params.postId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Not found" });
    }

    await doc.ref.update({ commentCount: doc.data().commentCount + 1 });

    const comment = {
      body: req.body.body,
      createdAt: new Date().toISOString(),
      username: req.user.username,
      postId: req.params.postId,
      userImage: req.user.imageUrl
    }

    await db.collection('comments').add(comment);
    
    return res.status(200).json({ comment });
  } catch (error) {
    return res.status(500).json({ error });
  }
}