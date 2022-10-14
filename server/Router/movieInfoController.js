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

//파이어 베이스 세팅 초기화
if (!firebase.apps.length) {
    firebase.initializeApp(config);
} 
else {
    firebase.app();
}
var db = firebase.firestore();





/*  영화 데이터 리스트 호출 컨트롤러  */
router.get("/", async  (req, res) => {

    var docId = req.query.doc_id
    console.log(docId)
    console.log("★★★★★★")
    const docRef = db.collection('movies').doc('00EqnpbmjNbjWa38DVzh');
    const snapshot = await docRef.get();
    
    db.collection('movies').orderBy("id",'asc').startAt(snapshot).limit(10).get()
    .then((snapshot) => {
        var rows = [];

        snapshot.forEach((doc) => {
            var childData = doc.data();
            
            childData.release_date = dateFormat(childData.release_date,"yyyy-mm-dd");
            childData.doc_id = doc.id 
            rows.push(childData);
             
        });

        res.send( {rows: rows}); 
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});


/*  영화정보 상세보기 컨트롤러 */
router.get("/movieDetail", (req, res) => {

    var id = req.query.id
    
    db.collection('movies').where('id', '==', id).get()
    .then((doc) => {
        doc.forEach(element => {
            res.send( {rows: element.data()});
        })
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
    
});


/*  영화 리뷰를 분석하여 긍정 & 부정 판단 컨트롤러  */
router.get("/reviewDeepLeaning", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };

    PythonShell.PythonShell.run ('Router/leaningModel/reviewDeepLearning2.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{

            resultArr = []

            results.forEach((document, index) => {

                if(index == results.length -1 ){
                    let oringData   = document.replace(`b\'`, '').replace(`\'`, '');
                    let toBuffer    = Buffer.from(oringData, 'base64');
                    let encodingStr = toBuffer.toString('utf-8');

                    resultArr.push(encodingStr);
                }
                else{
                    resultArr.push(document);
                }
            });
            res.send( {results: results});     
        }
    });    
});


/*
    PythonShell을 이용한 ignore 협업 필터링 사용
    콘텐츠 간의 유사토를 측정 하여 추천 영화 top10을 반환
    참고 URL : https://big-dream-world.tistory.com/66
    Direct 호출 URL 셈플 : http://localhost:5000/movieRecommended?id=315011
*/
router.get("/movieRecommended", (req, res) => {

    var id = req.query.id;//유사 콘텐츠를 찾을 대상 ID

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [id, 'value3'],
        encoding : 'utf8'
    };

    let top10Arr  ;//배열 상태의 결과값
    let top10Json ;//제이슨 상태의 결과값
    PythonShell.PythonShell.run ('Router/leaningModel/movieRecomDeepLeaning2.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{
            
            //성공시 TOP10 결과값 세팅
            var recommArr1 = [];
            var recommArr2 = [];
            top10Json1Cnt = JSON.parse(results[0].replace("'","")).totalCnt//앞뒤 공백 제거
            top10Json1    = JSON.parse(results[0].replace("'","")).result  //앞뒤 공백 제거

            if(Number(top10Json1Cnt) != 0){
                top10Json1 = JSON.parse(top10Json1);
                //배열로 전환
                var titleArr    = Object.values(top10Json1.title)
                var idArr       = Object.values(top10Json1.id)
                var genresArr   = Object.values(top10Json1.genres)
                var averageArr  = Object.values(top10Json1.vote_average)
                
                for(var i = 0 ; i <titleArr.length; i ++){

                    var chileData = {
                        id : idArr[i],
                        title : titleArr[i],
                        genres : genresArr[i],
                        vote_average : averageArr[i]
                        
                    }
                    recommArr1.push(chileData);    
                }
            }

            top10Json2Cnt = JSON.parse(results[1].replace("'","")).totalCnt//앞뒤 공백 제거
            top10Json2    = JSON.parse(results[1].replace("'","")).result//앞뒤 공백 제거

            if(Number(top10Json2Cnt) != 0){ 
                top10Json2 = JSON.parse(top10Json2);
                //배열로 전환
                var titleArr    = Object.values(top10Json2.title)
                var idArr       = Object.values(top10Json2.id)
                var genresArr   = Object.values(top10Json2.genres)
                var averageArr  = Object.values(top10Json2.vote_average)
                
                for(var i = 0 ; i <titleArr.length; i ++){

                    var chileData = {
                        id : idArr[i],
                        title : titleArr[i],
                        genres : genresArr[i],
                        vote_average : averageArr[i]
                        
                    }
                    recommArr2.push(chileData);    
                }
            }
            
            res.send( {recommArr1: recommArr1, recommArr2, recommArr2});    
               
        }
    });
});


/*
    영화 추천 시스템 구축을 위한 데이터 초기화 컨트롤러 
    원천 데이터 : https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata?resource=download
    ※호출 시 데이터가 중첩해 쌓이므로 FIREBASE STOREGE는 초기화 필요.
*/
router.get("/moviesDataInit", (req, res) => {
    
    const moviesResult = [];
    const creditsRsult = [];

    /* 영화 정보 DB저장
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies.csv')
    .pipe(csv())
    .on('data', (data) => moviesResult.push(data))
    .on('end', () => {
        count = 0 
        moviesResult.forEach((doc) => {

            //if(count > 20) return false
            count++

            var movieDoc = db.collection("movies").doc();

            var postData = {
                id                   : doc.id,
                title                : doc.title,
                budget               : doc.budget,
                genres               : doc.genres,
                keywords             : doc.keywords,
                homepage             : doc.homepage,
                original_language    : doc.original_language,
                original_title       : doc.original_title,
                overview             : doc.overview,
                popularity           : doc.popularity,
                production_companies : doc.production_companies,
                production_countries : doc.production_countries,
                release_date         : doc.release_date,
                revenue              : doc.revenue,
                runtime              : doc.runtime,
                spoken_languages     : doc.spoken_languages,
                status               : doc.status,
                tagline              : doc.tagline,
                vote_average         : doc.vote_average,
                vote_count           : doc.vote_count
            };
            movieDoc.set(postData);
        }); 
    });
    */

    // 출연진 정보 DB저장
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_credits.csv')
    .pipe(csv())
    .on('data', (data) => creditsRsult.push(data))
    .on('end', () => {
        count = 0 
        creditsRsult.forEach((doc) => {

            count++
            var creditsDoc = db.collection("credits").doc();
                var postData = {
                    id       : doc.movie_id,
                    title    : doc.title,
                    cast     : doc.cast,
                    crew     : doc.crew,
                };
                creditsDoc.set(postData);
        });
        res.json({data : creditsRsult});
    });
    
});





module.exports = router;