const express = require("express");
const router  = express.Router();

const firebase   = require("firebase"  );
const dateFormat = require('dateformat');

const csv = require('csv-parser');
const fs  = require('fs'        );

//유사 콘텐츠 추출을 위한 머신러닝 라이브러리
const dfd = require("danfojs"         );
const pd  = require("pandas"          );
const tf  = require("@tensorflow/tfjs");//느리다... @tensorflow/tfjs_node로 업데이트 필요

//파이썬 사용을 위한 라이브러리
const PythonShell = require("python-shell");

const commonController = require("./common.js");

//파일 업로드를 위한 multer, stream 세팅 
const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'C:/service/') //절대경로
        //callBack(null, 'uploads/') //상대경로(프로젝트 내부)
    },
    filename: (req, file, callBack) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        callBack(null, uniqueSuffix + '-' + `${file.originalname}` )
    }
})
const upload = multer({
    //storage: storage, //파일을 해당경로에 지정이름으로 저장
    storage: multer.memoryStorage() // 저장하지않고 파일정보와 buffer 반환.
});

// 파이어 베이스 설정 정보
const config = {
    apiKey: "AIzaSyCzWDbX5Qad0iyaxAeam45rUJxkV41yFPs",
    authDomain: "movie-f362d.firebaseapp.com",
    projectId: "movie-f362d",
    storageBucket: "movie-f362d.appspot.com",
    messagingSenderId: "189981538409",
    appId: "1:189981538409:web:8467d889ba0b0a66c9caf8",
    measurementId: "G-6HBJMJ7DKV"
};

// 파이어 베이스 세팅 초기화
if (!firebase.apps.length) {
    firebase.initializeApp(config);
} 
else {
    firebase.app();
}
var db = firebase.firestore();

/** 
 *   배열과 파일명을 파라메터로 받아 엘셀파일로 추출하는 함수
 *   @param rows    데이터 배열 
 *   @param fileNum 파일명 체번
 */
 function snapshotCall(doc_id, collectionNm){
    
    if(doc_id != ""){
        return new Promise(function (resolve, reject) {
            let snapshot = db.collection(collectionNm).doc(doc_id).get();
            resolve(snapshot).catch(null)
        });
    }
    else{
        return new Promise(function (resolve, reject) {
            let snapshot = db.collection(collectionNm).orderBy("id",'asc').limit(1).get();
            resolve(snapshot).catch(null)
        });
    }
}

module.exports = {
    foo: function (docid, collectionNm) {

        let snapshot = snapshotCall(docid, collectionNm);
        
        return snapshot;
    },
    bar: function () {
      // whatever
    }
};