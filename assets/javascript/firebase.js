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
    messagingSenderId: "514839071838"
};
firebase.initializeApp(jumplink.firebase.config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();



