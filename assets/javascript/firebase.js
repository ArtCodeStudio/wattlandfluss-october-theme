// firebase functions
jumplink = window.jumplink || {};
jumplink.firebase = window.jumplink.firebase || {};

// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.firebase = debug('theme:partials');

// Initialize Firebase
jumplink.firebase.config = {
    apiKey: "AIzaSyDrLQEPT31BcsK0L-yFFuAJmolAJZ3E7ac",
    authDomain: "jumplink-events.firebaseapp.com",
    databaseURL: "https://jumplink-events.firebaseio.com",
    projectId: "jumplink-events",
    storageBucket: "jumplink-events.appspot.com",
    messagingSenderId: "514839071838",
    customerDomain: 'watt-land-fluss.de' // custom config property
};
firebase.initializeApp(jumplink.firebase.config);



var originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(body) {
  if (body === '') {
    originalSend.call(this);
  } else {
    originalSend.call(this, body);
  }
};


// Initialize Cloud Firestore through Firebase

// @firebase/firestore: Firestore (4.13.0): 
// The behavior for Date objects stored in Firestore is going to change
// AND YOUR APP MAY BREAK.
// To hide this warning and ensure your app does not break, you need to add the
// following code to your app before calling any other Cloud Firestore methods:

//   const firestore = firebase.firestore();
//   const settings = {/* your settings... */ timestampsInSnapshots: true};
//   firestore.settings(settings);

// With this change, timestamps stored in Cloud Firestore will be read back as
// Firebase Timestamp objects instead of as system Date objects. So you will also
// need to update code expecting a Date to instead expect a Timestamp. For example:

//   // Old:
//   const date = snapshot.get('created_at');
//   // New:
//   const timestamp = snapshot.get('created_at');
//   const date = timestamp.toDate();

// Please audit all existing usages of Date when you enable the new behavior. In a
// future release, the behavior will change to the new behavior, so if you do not
// follow these steps, YOUR APP MAY BREAK.

var firestoreSettings = {timestampsInSnapshots: true};
var db = firebase.firestore();
db.settings(firestoreSettings);