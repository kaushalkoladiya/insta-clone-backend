const admin = require('firebase-admin');
const firebase = require('firebase');

const serviceAccount = require('./credential.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-12ee2.firebaseio.com"
});

var firebaseConfig = {
  apiKey: "AIzaSyBEpMnUn1WsNESwD2ctBaN-49zVlTf8Akc",
  authDomain: "social-12ee2.firebaseapp.com",
  databaseURL: "https://social-12ee2.firebaseio.com",
  projectId: "social-12ee2",
  storageBucket: "social-12ee2.appspot.com",
  messagingSenderId: "534761924902",
  appId: "1:534761924902:web:6605660d8b2fa809d739e7",
  measurementId: "G-DZ6H7F510P"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


exports.admin = admin;
exports.db = admin.firestore();
exports.firebase = firebase;