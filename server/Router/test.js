const express = require("express");
const router  = express.Router();

var firebase   = require("firebase"  );
var dateFormat = require('dateformat');

const csv = require('csv-parser');
const fs  = require('fs'        );

//유사 콘텐츠 추출을 위한 머신러닝 라이브러리
const dfd = require("danfojs"         );
const pd  = require("pandas"          );
const tf  = require("@tensorflow/tfjs");//느리다... @tensorflow/tfjs_node로 업데이트 필요

const PythonShell = require("python-shell");


/* 영화 DB */
const config = {
    apiKey: "AIzaSyCzWDbX5Qad0iyaxAeam45rUJxkV41yFPs",
    authDomain: "movie-f362d.firebaseapp.com",
    projectId: "movie-f362d",
    storageBucket: "movie-f362d.appspot.com",
    messagingSenderId: "189981538409",
    appId: "1:189981538409:web:8467d889ba0b0a66c9caf8",
    measurementId: "G-6HBJMJ7DKV"
  };

firebase.initializeApp(config);
var db = firebase.firestore();


/*  영화 데이터 리스트 세팅  */
router.get("/", (req, res) => {
    
    var moviesResult2 = [];
    db.collection('movies').orderBy("release_date","desc").limit(100).get()
    .then((snapshot) => {
        var rows = [];

        snapshot.forEach((doc) => {
            var childData = doc.data();
            childData.release_date = dateFormat(childData.release_date,"yyyy-mm-dd");

            rows.push(childData);
            moviesResult2.push(childData);
             
        });

        res.send( {rows: rows}); 
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

/*  영화 상세보기  */
router.get("/movieDetail", (req, res) => {

    var id = req.query.id

    db.collection('movies').where('movie_id', '==', id).get()
    .then((doc) => {
        doc.forEach(element => {
            //console.log(element);
            res.send( {rows: element.data()});
        })
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
    
});


/*
    PythonShell을 이용한 ignore 협업 필터링 사용
    콘텐츠 간의 유사토를 측정 하여 추천 영화 top10을 반환
    참고 사이트 : https://big-dream-world.tistory.com/66
*/
router.get("/movieRecommended", (req, res) => {

    var id = req.query.id//유사 콘텐츠를 찾을 대상 ID
    
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [id, 'value2', 'value3'],
        encoding : 'utf8'
    };

    let top10Arr  ;//배열 상태의 결과값
    let top10Json ;//제이슨 상태의 결과값
    PythonShell.PythonShell.run ('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/test1.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{
            //성공시 TOP10 결과값 세팅
            var rows = [];
            
            top10Json = JSON.parse(results[0].replace("'",""))//앞뒤 공백 제거

            /* 배열로 전환 */
            var titleArr    = Object.values(top10Json.title)
            var idArr       = Object.values(top10Json.id)
            var averageArr  = Object.values(top10Json.vote_average)
            var weightedArr = Object.values(top10Json.weighted_vote)
            
            for(var i = 0 ; i <titleArr.length; i ++){

                var chileData = {
                    id : idArr[i],
                    title : titleArr[i],
                    vote_average : averageArr[i],
                    weighted_vote : weightedArr[i]
                }
                rows.push(chileData);    
            } 
            res.send( {rows: rows} );
        }
        //console.log('results: %j', results);
    });

    /*  ○○ danfojs를 사용한 csv 추출미 데이터 가공 예제 ○○
        ※ 참조 링크 :  https://danfo.jsdata.org/getting-started
        concat : 데이터 프레임들을 연결
        mean   : 숫자를 소수점 까지 표현
        merge  : 데이터 프레임 합치기
        monthName : 날자 폼에서 월 명을 반환 1 -> January

        ★★ 그외 스크립트에서 cvs를 실행하여 통계, 차트 등의 관측이 가능 하다. ★★
    */
    /*
    var moviesResult = [];
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies copy.csv')
    .pipe(csv())
    .on('data', (data) =>{ moviesResult.push(data) })
    .on('end', () => {
        
        var df = new  dfd.DataFrame(moviesResult);

        df.print();//테이블 형식으로 출력
        df.iloc({ rows: [":"], columns: ["1:2"]}).print();//모든열 두번쩨 컬럼 반환
        df.iloc({ rows: ["0:2"], columns: [":"]}).print();//2열까지 모든 컬럼 반환
        df.iloc({ rows: df["vote_average"].gt(7) }).print();//해당 컬럼이 7보다 큰 열 반환
        df.iloc({ rows: df["vote_average"].gt(7).and(df["title"].eq("Avatar")), columns: [0]}).print();//해당컬럼이 10보다 크고 이름이 사과인것 1열 반환
        df.isNa().print();//열에서 NaN 는 true 나머지 false 반환
        console.log(df.tensor);//전체 데이터 프레임 출력
        
    });
    */
});

/*
    추천 영화 머신러닝 예제 (참조링크  : https://proinlab.com/archives/2103 , https://www.npmjs.com/package/nodeml)
    1. User-based CF (ex > 넷플릭스 : 사용자의 시청 영화에 따라 영화 추천 )
*/
router.get("/nodemlSample", (req, res) => {

    const {Bayes} = require('nodeml');
    let bayes = new Bayes();
    
    bayes.train({'fun': 3, 'couple': 1}, 'comedy');
    bayes.train({'couple': 1, 'fast': 1, 'fun': 3}, 'comedy');
    bayes.train({'fast': 3, 'furious': 2, 'shoot': 2}, 'action');
    bayes.train({'furious': 2, 'shoot': 4, 'fun': 1}, 'action');
    bayes.train({'fly': 2, 'fast': 3, 'shoot': 2, 'love': 1}, 'action');
    
    let results = bayes.test({'fun': 3, 'fast': 3, 'shoot': 2});

    /** ****************************************************************** */

    const {sample} = require('nodeml');
    const bbc = sample.bbc();
    const yeast = sample.yeast();
    const iris = sample.iris();
    const movie = sample.movie();

    const {CF} = require('nodeml');//Collaborative Filtering(협업 필터링)
    const {evaluation} = require('nodeml');//평가

    let train = [],  test =[] , testOnlyOne = [{ movie_id: '276', user_id: '20240', rating: '5', like: '1' }]; //1. 트레이닝(학습) 집합 2. 테스트 집합

    for (let i = 0; i < movie.length; i++) {
        if (Math.random() > 0.8) test.push(movie[i]);
        else train.push(movie[i]);
    }

    const cf = new CF();

    cf.maxRelatedItem = 40;
    cf.maxRelatedUser = 40;

    cf.train(train, 'user_id', 'movie_id', 'rating');// data , userId, itemId , feature  (인공지는 학습 데이터 구성)

    let gt = cf.gt(testOnlyOne, 'user_id', 'movie_id', 'rating');//테스트 데이터 세팅
    let result = cf.recommendGT(gt, 40);//테스트 데이터를 대상으로 40개씩 영화 추천

    let ndcg = evaluation.ndcg(gt, result);
    console.log(gt);
    console.log(result);
    console.log(ndcg);

    res.send({test : "hi"});
});


/*
    영화 추천 시스템 구축을 위한 데이터 초기화 컨트롤러 ( 원천 데이터 : https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata?resource=download )
    ※호출 시 데이터가 중첩해 쌓이므로 FIREBASE STOREGE는 초기화 필요. (추후 데이터 초기화 소스 추가 예정)
*/
router.get("/moviesDataInit", (req, res) => {
    
    const moviesResult = [];
    const creditsRsult = [];
    /* 영화 정보 
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
                id                   : movieDoc.id,
                movie_id             : doc.id,
                title                : doc.title,
                budget               : doc.budget,
                genres               : doc.genres,
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
    /*  출연진 정보 */
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_credits.csv')
    .pipe(csv())
    .on('data', (data) => creditsRsult.push(data))
    .on('end', () => {
        count = 0 

        creditsRsult.forEach((doc) => {

            //if(count > 20) return false
            count++

            var creditsDoc = db.collection("credits").doc();

                var postData = {
                    id       : creditsDoc.id,
                    movie_id : doc.movie_id,
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