const { admin, db } = require('../db.config');

module.exports = async (req, res, next) => {
  const tokenString = req.get('Authorization')

  if (!tokenString) {
    return res.status(403).json({ message: 'Unauthozied' });
  }
  const idToken = tokenString.split('Bearer ')[1];
  let decodedToken;

  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
    const data = await db.collection('users').where('userId', '==', decodedToken.uid).limit(1).get();
    req.user = data.docs[0].data();
    req.userId = decodedToken.uid;
    return next();
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
}