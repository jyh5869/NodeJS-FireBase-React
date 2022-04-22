const express = require("express");
const router = express.Router();

var firebase = require("firebase");

var dateFormat = require('dateformat');
const csv = require('csv-parser');
const fs = require('fs');

var evaluate = require('eval-literals');//문자열을 리스트 객체로 변환




const dfd = require("danfojs");
const tf = require("@tensorflow/tfjs");//느리다... @tensorflow/tfjs_node로 업데이트 필요
//const tf = dfd.tensorflow;



const PythonShell = require("python-shell");
var options = {

    mode: 'text',
  
    pythonPath: '',
  
    pythonOptions: ['-u'],
  
    scriptPath: '',
  
    args: ['value1', 'value2', 'value3']
  
  };




/* 영화 */
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


router.get("/", (req, res) => {
    
    /*
    const {ig} = require('ignore');
    const pd = require("node-pandas-js")

    var moviesResult = [];
    
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies copy.csv')
    .pipe(csv())
    .on('data', (data) =>{ moviesResult.push(data) })
    .on('end', () => {
        var df = pd.DataFrame(moviesResult);
        console.log(df);
    });
    */


    var moviesResult = [];
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies copy.csv')
    .pipe(csv())
    .on('data', (data) =>{ moviesResult.push(data) })
    .on('end', () => {
        
        //let tensor_arr = tf.tensor(moviesResult);
        var df = new  dfd.DataFrame(moviesResult);
        


        /*
            ※ 참조 링크 :  https://danfo.jsdata.org/getting-started
            concat : 데이터 프레임들을 연결
            mean   : 숫자를 소수점 까지 표현
            merge  : 데이터 프레임 합치기
            monthName : 날자 폼에서 월 명을 반환 1 -> January

            ★★ 그외 스크립트에서 cvs를 실행하여 통계, 차트 등의 관측이 가능 하다. ★★
        */
        df.print();//테이블 형식으로 출력
        df.iloc({ rows: [":"], columns: ["1:2"]}).print();//모든열 두번쩨 컬럼 반환
        df.iloc({ rows: ["0:2"], columns: [":"]}).print();//2열까지 모든 컬럼 반환
        df.iloc({ rows: df["vote_average"].gt(7) }).print();//해당 컬럼이 7보다 큰 열 반환
        df.iloc({ rows: df["vote_average"].gt(7).and(df["title"].eq("Avatar")), columns: [0]}).print();//해당컬럼이 10보다 크고 이름이 사과인것 1열 반환
        df.isNa().print();//열에서 NaN 는 true 나머지 false 반환
        console.log(df.tensor);//전체 데이터 프레임 출력


        
          // 1. 데이터를 준비
          var movieDf = df.loc({ columns: ['id','title','genres','vote_average', 'vote_count', 'popularity', 'keywords', 'overview']} )
        
          PythonShell.PythonShell.run ('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/test1.py', options, function (err, results) {
            
            if (err) {
                console.log("통신실패");
                console.log(err);
            
            }   
            else{
                console.log("통신성공");
                console.log(results);
            } 

            //console.log('results: %j', results);
            console.log("★★★★★★★");
        });
    });




    
    /*
    var moviesResult2 = [];
    db.collection('movies').orderBy("release_date","desc").get()
    .then((snapshot) => {
        var rows = [];

        snapshot.forEach((doc) => {
            var childData = doc.data();
            childData.release_date = dateFormat(childData.release_date,"yyyy-mm-dd");

            rows.push(childData);
            moviesResult2.push(childData);
             
        });

        const pd2 = require("node-pandas-js")
        var df = pd2.DataFrame(moviesResult2);
        var movies_df = df['id','title','genres','vote_average', 'vote_count', 'popularity', 'keywords', 'overview']
        console.log(movies_df);

        //evaluate
        
        //movies_df['genres'] = eval(movies_df['genres'])
        //movies_df['keywords'] = movies_df['keywords'].apply(evaluate)
        console.log(movies_df['genres']);
        
        movies_df['genres'] = movies_df['genres'].apply(lambda x : [y['name'] for y in x])
        movies_df['keywords'] = movies_df['keywords'].apply(lambda x : [y['name'] for y in x])
        print(movies_df['genres'].head(1))
        print(movies_df['keywords'].head(1))
        
       
        res.send( {rows: rows});
        
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
    */
});


/*
    추천 상품 머신러닝 (참조링크  : https://proinlab.com/archives/2103 , https://www.npmjs.com/package/nodeml)
    1. User-based CF (ex > 넷플릭스 : 사용자의 시청 영화에 따라 영화 추천 )
*/
router.get("/nodemlMovie", (req, res) => {

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
*/
router.get("/moviesDataInit", (req, res) => {
    
    const moviesResult = [];
    const creditsRsult = [];
    /* 영화 정보 */
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies.csv')
    .pipe(csv())
    .on('data', (data) => moviesResult.push(data))
    .on('end', () => {
        count = 0 
        moviesResult.forEach((doc) => {

            if(count > 20) return false
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
        res.json({data : moviesResult});
    });
    
    /*  출연진 정보 */
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_credits.csv')
    .pipe(csv())
    .on('data', (data) => creditsRsult.push(data))
    .on('end', () => {
        count = 0 

        creditsRsult.forEach((doc) => {

            if(count > 20) return false
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
    });
    
});


module.exports = router;