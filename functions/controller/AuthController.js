const { db, firebase, firebaseConfig: { storageBucket } } = require('../db.config');
const { validationResult } = require('express-validator');

exports.signup = async (req, res, next) => {
  try {
    const validatedData = validationResult(req);
    if (!validatedData.isEmpty()) {
      res.status(400).json({ validation: validatedData.errors });
    }
    const { exists } = await db.doc(`/users/${req.body.username}`).get();

    if (exists) {
      return res.status(400).json({ username: 'This username already taken' });
    }

    const { user } = await firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password);
    const token = await user.getIdToken();
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/user_90px.png?alt=media`

    const userProfile = {
      userId: user.uid,
      email: req.body.email,
      username: req.body.username,
      createdAt: new Date().toISOString(),
      imageUrl
    }

    await db.doc(`/users/${req.body.username}`).set(userProfile);

    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Somthing went wrong, please try again." });
  }
}

exports.login = async (req, res, next) => {
  try {
    const validatedData = validationResult(req);
    if (!validatedData.isEmpty()) {
      res.status(400).json({ validation: validatedData.errors });
    }
    const { user } = await firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password);
    const token = await user.getIdToken();
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
}