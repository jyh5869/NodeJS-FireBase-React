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
 *   @author 파이어베이스 문서 ID와 컬렉션명을 받아 스넵샷으로 리턴 (해당스냅샷 기준으로 페이징 처리)
 *   @param docId 문서ID
 *   @param collectionNm 컬렉션 명
 */
 function getSnapshot(docId, collectionNm, type, countPerPage){
    
    return new Promise(function (resolve, reject) {
        
        let docRef  ;
        let snapShot ;
        console.log(docId);
        console.log(collectionNm);
        console.log(type);
        console.log(countPerPage);

        if(docId != undefined){
            console.log("11111111111111%%%%%%%%%%%%%%%%5");
            snapshot = db.collection(collectionNm).doc(docId).get();
            
            if(type == undefined){
                docRef = db.collection(collectionNm).orderBy("id", 'desc').limit(Number(countPerPage)).get()         
            }
            else if(type == "next"){
                docRef = db.collection(collectionNm).orderBy("id", 'desc').startAfter(snapshot).limit(Number(countPerPage)).get()
            }
            else if(type == "prev"){
                docRef = db.collection(collectionNm).orderBy("id", 'desc').startAt(snapshot).limit(Number(countPerPage)).get()
                
            }    
            resolve(docRef);
        }
        else{
            console.log("222222222222 type = " + type + "     countPerPage = " + countPerPage );
            var snapshot = db.collection(collectionNm).orderBy("id", 'desc').limit(1).get()

                if(type == undefined || type == ""){
                    docRef = db.collection(collectionNm).orderBy("id", 'desc').limit(Number(countPerPage)).get()         
                }
                else if(type == "next"){
                    docRef = db.collection(collectionNm).orderBy("id", 'desc').startAfter(snapshot).limit(Number(countPerPage)).get()
                }
                else if(type == "prev"){
                    docRef = db.collection(collectionNm).orderBy("id", 'desc').startAt(snapshot).limit(Number(countPerPage)).get()
                    
                }    
                resolve(docRef);
        }    
    });

}

module.exports = {
    getTargetSnaphot: async function (docId, collectionNm, type, countPerPage) {
        console.log("1.함수 진입")
        const snapshot = await getSnapshot(docId, collectionNm, type, countPerPage);

        console.log("3.리턴");
        return snapshot;
        
    },
    getFunction: function () {

    }
};