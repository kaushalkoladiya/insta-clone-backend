const { validationResult } = require('express-validator');
const { db, admin, firebaseConfig: { storageBucket } } = require('../db.config');

exports.imageUpload = (req, res, next) => {
  const Busboy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new Busboy({ headers: req.headers });

  let imageFileName;
  let imageToBeUpdated = {};

  busboy.on('file', (field, file, filename, encoding, mimeType) => {
    if (mimeType !== 'image/png' && mimeType !== 'image/jpeg' && mimeType !== 'image/jpg') {
      return res.status(400).json({ error: 'Wrong image type.' });
    }
    const filenameArray = filename.split('.');
    const fileEx = filenameArray[filenameArray.length - 1];

    imageFileName = `${new Date().getTime()}.${fileEx}`;
    const filePath = path.join(os.tmpdir(), imageFileName);
    imageToBeUpdated = { filePath, mimeType };
    file.pipe(fs.createWriteStream(filePath));
    return true;
  });
  try {
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
      await db.doc(`/users/${req.user.username}`).update({ imageUrl });

      return res.status(200).json({ message: "Succefully uploaded" });
    });
    busboy.end(req.rawBody);
    return true;
  } catch (error) {
    return res.status(500).json({ error });
  }
}

exports.update = async (req, res, next) => {
  try {
    const validatedData = validationResult(req);
    if (!validatedData.isEmpty()) {
      res.status(400).json({ validation: validatedData.errors });
    }
    await db.doc(`/users/${req.user.username}`).update({
      bio: req.body.bio,
      location: req.body.location,
      website: req.body.website
    });
    return res.status(200).json({ message: 'Update Successfully' });
  } catch (error) {
    return res.status(500).json({ error });
  }
}

// Currently logged in user's data
exports.userData = async (req, res, next) => {
  try {
    const userData = {};
    const doc = await db.doc(`/users/${req.user.username}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Not Found" });
    }
    userData.user = doc.data();

    const data = await db.collection('likes').where('username', '==', req.user.username).get();
    userData.likes = [];
    data.forEach(doc => {
      userData.likes.push(doc.data());
    })

    const notifications = await db.collection('notifications').where('recipient', '==', req.user.username).orderBy('createdAt', 'desc').limit(10).get();
    userData.notifications = [];
    notifications.forEach(doc => {
      userData.notifications.push({
        createdAt: doc.data().createdAt,
        postId: doc.data().postId,
        recipient: doc.data().recipient,
        sender: doc.data().sender,
        read: doc.data().read,
        type: doc.data().type,
        notificationId: doc.id,
      });
    });
    return res.status(200).json({ userData });

  } catch (error) {
    return res.status(500).json({ error });
  }
}

exports.show = async (req, res, next) => {
  try {
    let userData = {};
    const doc = await db.doc(`/users/${req.params.username}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Not Found" });
    }
    userData.user = doc.data();
    const posts = await db.collection('posts').where('username', '==', req.params.username).orderBy('createdAt', 'desc').get();
    userData.posts = [];
    posts.forEach(doc => {
      userData.posts.push({
        postId: doc.id,
        body: doc.data().body,
        commentCount: doc.data().commentCount,
        createdAt: doc.data().createdAt,
        imageUrl: doc.data().imageUrl,
        likeCount: doc.data().likeCount,
        username: doc.data().username,
      });
    });
    return res.status(200).json({userData});
  } catch (error) {
    return res.status(500).json({error});
  }
}