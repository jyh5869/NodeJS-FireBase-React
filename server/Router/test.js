const express = require("express");
const router = express.Router();

var firebase = require("firebase");
var dateFormat = require('dateformat');
 
var config = {
    apiKey: "AIzaSyD_tg-m8Y77Q7K_w2lyY68igE4RWy-63DY",
    authDomain: "nodejs-54f7b.firebaseapp.com",
    databaseURL: "https://nodejs-54f7b-default-rtdb.firebaseio.com",
    projectId: "nodejs-54f7b",
    storageBucket: "nodejs-54f7b.appspot.com",
    messagingSenderId: "647841088954",
    appId: "1:647841088954:web:03a1abd6bf64a363d7c983",
    measurementId: "G-4LBL09LTYG"
};
firebase.initializeApp(config);
var db = firebase.firestore();

router.get("/", (req, res) => {
    
    db.collection('board').orderBy("brddate","desc").get()
    .then((snapshot) => {
        var rows = [];
        snapshot.forEach((doc) => {
            var childData = doc.data();
            childData.brddate = dateFormat(childData.brddate,"yyyy-mm-dd");
            rows.push(childData);
        });
        res.send( {rows: rows});
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });

});

router.get("/api", (req, res) => {
    console.log("★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★");
    res.send({test : "hi"});
});

module.exports = router;