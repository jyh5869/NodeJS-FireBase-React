const express = require("express");
const router  = express.Router();

const commonUtil = require("./common.js");

const db          = commonUtil.getFirebaseDB();
const fs          = commonUtil.getFileStreamObj();
const csv         = commonUtil.getReadCSVObj();
const dateFormat  = commonUtil.getDataFormatObj();
const PythonShell = commonUtil.getPythonShellObj();





/**
 * @author 영화 데이터 리스트 호출 컨트롤러
**/
router.get("/", async (req, res) => {

    let docId  = req.query.doc_id
    let type   = req.query.type
    let collectionNm = "movies"; 
    
    await commonUtil.getTargetSnaphot(docId, collectionNm, type, 10)
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


/**
 * @author 영화 상세정보 컨트롤러
**/
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


/**
 * @author 영화 리뷰를 분석하여 긍정 & 부정 판단 컨트롤러
**/
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


/**
 * @author 콘텐츠간의 유사도를 측정하여 추천 영화 top10을 반환(PythonShell을 이용한 ignore 협업 필터링)
**/
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


/**
 * @author 영화 추천 시스템 구축을 위한 데이터 초기화 컨트롤러
 * @author ※ 원천 데이터 : /https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata?resource=download
 * @author ※ 호출 시 데이터가 중첩해 쌓이므로 FIREBASE STOREGE는 초기화 필요.
**/
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