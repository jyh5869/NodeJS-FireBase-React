const firebase = require("firebase");
const config   = {
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
 * @author 파이어베이스 문서 ID와 컬렉션명을 받아 스넵샷으로 리턴 (해당스냅샷 기준으로 페이징 처리)
 * @returns 파이어베이스 스넵샷  
 * @param docId        : 문서 인덱스
 * @param collectionNm : 컬렉션 명
 * @param type         : 페이징 타입 next & prev
 * @param countPerPage : 페이지당 보여줄 문서 갯수
**/
 function getSnapshot(docId, collectionNm, type, countPerPage){
    
    return new Promise(function (resolve, reject) {
        
        let docRef;

        if(docId != undefined){    
            db.collection(collectionNm).doc(String(docId)).get().then(function(snapshot){
                
                if(type == "next"){
                    docRef = db.collection(collectionNm).orderBy("id", 'desc').startAt(snapshot).limit(Number(countPerPage+1)).get()
                }
                else if(type == "prev"){
                    docRef = db.collection(collectionNm).orderBy("id", 'desc').startAt(snapshot).limit(Number(countPerPage+1)).get()
                }    
                resolve(docRef);
            });
        }
        else{
            db.collection(collectionNm).orderBy("id", 'desc').limit(Number(countPerPage+1)).get().then(function(docRef){
                resolve(docRef);
            })        
        }    
    });
}


/** 
 * @author 파일업로드를 위한 객체 반환
 * @returns 파일업로드 객체
**/
function getUploadObj(){
    //파일 업로드를 위한 multer, stream 세팅 
    const multer = require("multer");

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

    var upload = multer({
        //storage: storage, //파일을 해당경로에 지정이름으로 저장
        storage: multer.memoryStorage() // 저장하지않고 파일정보와 buffer 반환.
    });

    return upload;
}



module.exports = {
    getTargetSnaphot: async function (docId, collectionNm, type, countPerPage) {
        //파이어베이스 스냅샷 호출 함수
        const snapshot = await getSnapshot(docId, collectionNm, type, countPerPage);

        return snapshot;
    },
    getFirebaseDB: function () {
        //파이어 베이스 데이터베이스 객체 호출
        return db;
    },
    getFirebaseObj: function () {
        //파이어 베이스 객체 호출(사용자 권한 관리를 위함)
        return firebase;
    },
    getUploadObj: function() {
        //파일 업로드를 위한 객체 호출 함수
        const uploadObj = getUploadObj();

        return uploadObj;
    },
    getDataFormatObj: function() {     
        //날짜 처리를 위한 라이브러리   
        const dataformat = require('dateformat');

        return dataformat;
    },
    getFileStreamObj: function() {
        //파일 처리를 위한 라이브러리
        const fileStream  = require('fs');

        return fileStream;
    },
    getPythonShellObj: function() {
        //파이썬 사용을 위한 라이브러리
        const PythonShell = require("python-shell");

        return PythonShell;
    },
    getReadCSVObj: function() {
        //CSV파일을 읽기 위한 라이브러리
        const readCSV = require('csv-parser');

        return readCSV;
    },
    getUserIp : function(){
        //접속 IP를 반환하기 위한 라이브러리
        const requestIp = require("ip");

        return requestIp.address();
    },
    getModelInfo : function(targetNm){
        //접속 IP를 구분값으로 세팅된 모델경로 환경을 리턴(접속환경에 따라 유연하게 대응하기 위함)
        const requestIp = require("ip");

        let returnParam; 

        if(requestIp.address() == "192.168.219.103"){
            if(targetNm == "saveModelNm"){
                returnParam = 'model_flw';
            }
            else if(targetNm == "datasetUrl"){
                returnParam = 'D:/Development/DeveloperKits/Tensorflow/datasets/flower_photos';
            }
            else if(targetNm == "reulstImgPath"){
                returnParam = 'D:/Development/DeveloperKits/Tensorflow/trainingResImg/';
            }
            else if(targetNm == "saveModelUrl"){
                returnParam = 'D:/Development/DeveloperKits/Tensorflow/model/';
            }
        }
        else{
            if(targetNm == "saveModelNm"){
                returnParam = 'model_flw';
            }
            else if(targetNm == "datasetUrl"){
                returnParam = 'C:/Users/all4land/.keras/datasets/flower_photos';
            }
            else if(targetNm == "reulstImgPath"){
                returnParam = 'C:/Users/all4land/.keras/trainingResImg/';
            }
            else if(targetNm == "saveModelUrl"){
                returnParam = 'C:/Users/all4land/.keras/model/';
            }
        }
        return returnParam;
    }
};