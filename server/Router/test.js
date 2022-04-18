const express = require("express");
const router = express.Router();

var firebase = require("firebase");
var dateFormat = require('dateformat');

/*  다이어리
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
*/
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
    */
});


/*
    추천 상품 머신러닝 (참조링크  : https://proinlab.com/archives/2103 , https://www.npmjs.com/package/nodeml)
    1. User-based CF (ex > 넷플릭스 : 사용자의 시청 영화에 따라 영화 추천 )
*/
router.get("/nodemlMovie", (req, res) => {

    const csv = require('csv-parser')
    const fs = require('fs')
    const resultsqw = [];

    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies.csv')
    .pipe(csv())
    .on('data', (data) => resultsqw.push(data))
    .on('end', () => {
        console.log(resultsqw);
        // [
        //   { NAME: 'Daffy Duck', AGE: '24' },
        //   { NAME: 'Bugs Bunny', AGE: '22' }
        // ]
    });

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
    console.log(result);-
    console.log(ndcg);

    res.send({test : "hi"});
});


/*
    추천 상품 머신러닝 (참조링크  : https://proinlab.com/archives/2103 , https://www.npmjs.com/package/nodeml)
    1. User-based CF (ex > 넷플릭스 : 사용자의 시청 영화에 따라 영화 추천 )
*/
router.get("/nodemlMovie2", (req, res) => {

    const csv = require('csv-parser');
    const fs = require('fs');
    
    const movieSResult = [];
    const creditsRsult = [];
    /* 영화 정보 */
    fs.createReadStream('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies.csv')
    .pipe(csv())
    .on('data', (data) => movieSResult.push(data))
    .on('end', () => {
        count = 0 
        movieSResult.forEach((doc) => {

            if(count > 20) return false
            count++

            var movieDoc = db.collection("movies").doc();

            var postData = {
                id: movieDoc.id,
                movieId : doc.id,
                title   : doc.title,
                budget     : doc.budget,
                genres  : doc.genres,
                homepage   : doc.homepage,
                original_language   : doc.original_language,
                original_title : doc.original_title,
                overview     : doc.overview,
                popularity  : doc.popularity,
                production_companies   : doc.production_companies,
                production_countries   : doc.production_countries,
                release_date : doc.release_date,
                revenue     : doc.revenue,
                runtime  : doc.runtime,
                spoken_languages   : doc.spoken_languages,
                status   : doc.status,
                tagline   : doc.tagline,
                vote_average   : doc.vote_average,
                vote_count   : doc.vote_count
            };
            movieDoc.set(postData);
            
        });
        
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
                    id: creditsDoc.id,
                    movieId : doc.movie_id,
                    title   : doc.title,
                    budget     : doc.cast,
                    genres  : doc.crew,

                };
                creditsDoc.set(postData);
        
        });
    });

    res.json({data : creditsRsult});
});


module.exports = router;