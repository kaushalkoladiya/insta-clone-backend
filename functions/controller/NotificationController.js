const { db } = require('../db.config');

exports.markAsRead = async (req, res, next) => {
  try {
    const batch = db.batch();

    req.body.forEach(notificationId => {
      const notiRef = db.doc(`/notifications/${notificationId}`);
      batch.update(notiRef, { read: true });
    });
    await batch.commit();

    return res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
}