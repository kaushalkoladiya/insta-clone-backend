const { db } = require('../db.config');

exports.store = async (req, res, next) => {
  try {
    const doc = await db.doc(`/posts/${req.params.postId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Not Found" });
    }
    const post = doc.data();
    post.postId = doc.id;

    const likeDoc = await db.collection('likes')
      .where('username', '==', req.user.username)
      .where('postId', '==', req.params.postId)
      .limit(1)
      .get();

    if (!likeDoc.empty) {
      return res.status(400).json({ error: "Already liked" });
    }

    await db.collection('likes').add({ username: req.user.username, postId: req.params.postId })
    post.likeCount++;
    await db.doc(`/posts/${req.params.postId}`).update({ likeCount: post.likeCount });

    return res.status(200).json({ post });
  } catch (error) {
    return res.status(500).json({ error });
  }
}

exports.destroy = async (req, res, next) => {
  try {
    const doc = await db.doc(`/posts/${req.params.postId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Not Found" });
    }
    const post = doc.data();
    post.postId = doc.id;

    const likeDoc = await db.collection('likes')
      .where('username', '==', req.user.username)
      .where('postId', '==', req.params.postId)
      .limit(1)
      .get();

    console.log(likeDoc.empty);

    if (likeDoc.empty) {
      return res.status(400).json({ error: "Not liked yet!" });
    }

    await db.doc(`/likes/${likeDoc.docs[0].id}`).delete();
    post.likeCount--;
    await db.doc(`/posts/${req.params.postId}`).update({ likeCount: post.likeCount });

    return res.status(200).json({ post });
  } catch (error) {
    return res.status(500).json({ error });
  }
}