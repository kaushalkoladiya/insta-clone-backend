const { validationResult } = require('express-validator');
const { db, admin, firebaseConfig: { storageBucket } } = require('../db.config');

exports.index = async (req, res, next) => {
  try {
    const data = await db.collection('posts').orderBy('createdAt', 'desc').get();
    let posts = [];
    data.forEach(doc => {
      posts.push({
        postId: doc.id,
        username: doc.data().username,
        body: doc.data().body,
        image: doc.data().image,
        createdAt: doc.data().createdAt,
        imageUrl: doc.data().imageUrl,
        likeCount: doc.data().likeCount,
        commentCount: doc.data().commentCount,
      });
    });

    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.store = async (req, res, next) => {
  try {
    const Busboy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const body_str_from_buffer = req.body.toString('utf8', req.body.indexOf('body') + 5);

    const postBody = body_str_from_buffer.split('-----', 1)[0].trim();

    const busboy = new Busboy({ headers: req.headers });
    let imageFileName;
    let imageToBeUpdated = {};
    busboy.on('file', (field, file, filename, encoding, mimeType) => {
      if (mimeType !== 'image/png' && mimeType !== 'image/jpeg' && mimeType !== 'image/jpg') {
        return res.status(400).json({ error: 'Wrong image type, choose png, jpeg, jpg only.' });
      }
      const filenameArray = filename.split('.');
      const fileEx = filenameArray[filenameArray.length - 1];

      imageFileName = `${new Date().getTime()}.${fileEx}`;
      const filePath = path.join(os.tmpdir(), imageFileName);
      imageToBeUpdated = { filePath, mimeType };
      file.pipe(fs.createWriteStream(filePath));
      return true;
    });

    busboy.on('finish', async () => {
      await admin.storage().bucket().upload(imageToBeUpdated.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUpdated.mimeType
          }
        }
      });
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${imageFileName}?alt=media`;//&token=cb6586ed-8e90-4792-8628-39b5095a123b`;

      const post = {
        body: postBody,
        username: req.user.username,
        createdAt: new Date().toISOString(),
        image: imageUrl,
        imageUrl: req.user.imageUrl,
        likeCount: 0,
        commentCount: 0,
      }

      const doc = await db.collection('posts').add(post);
      post.postId = doc.id;

      return res.json({ post });
    });
    return busboy.end(req.rawBody);

  } catch (error) {
    return res.status(500).json({ error: error.message });
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
    return res.status(500).json({ error: error.message });
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
    return res.status(500).json({ error: error.message });
  }
}