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

  } catch (error) {
    return res.status(500).json({ error: error.message });
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
    if (doc.exists) {
      userData.user = doc.data();
    }

    const data = await db.collection('likes').where('username', '==', req.user.username).get();
    userData.likes = [];
    data.forEach(doc => {
      userData.likes.push(doc.data());
    })
    return res.status(200).json({ userData });  

  } catch (error) {
    return res.status(500).json({ error });
  }
}