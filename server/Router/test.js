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

/* 파일 업로드를 위한 multer, stream 세팅 s */
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
    
    db.collection('movies').orderBy("id",'asc').limit(10).get()
    .then((snapshot) => {
        var rows = [];

        snapshot.forEach((doc) => {
            var childData = doc.data();
            childData.release_date = dateFormat(childData.release_date,"yyyy-mm-dd");

            rows.push(childData);
             
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

/*  영화 상세보기  */
router.get("/reviewDeepLeaning", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };


    PythonShell.PythonShell.run ('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/reviewDeepLearning2.py', options, function (err, results) {

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
        //console.log('results: %j', results);
    });
    
});

/*  영화 상세보기  */
router.get("/imageDeepLeaning1", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };


    PythonShell.PythonShell.run ('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/imageDeepLearningType1.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{

            res.send( {results: results});     
        }
        //console.log('results: %j', results);
    });
    
});

/*  영화 상세보기  */
router.get("/imageDeepLeaning2", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };


    PythonShell.PythonShell.run ('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/imageDeepLearningType2.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{

            res.send( {results: results});     
        }
        //console.log('results: %j', results);
    });
    
});


/*  위 두 컨트롤러에서 생성된 모델을 사용해 이미지 분류(꽃)  */
router.post("/flowerAnalysis", upload.single('file'),  (req, res,  next) => {

    const file = req.file;

    console.log(file);
    //console.log(file.buffer);
    
    if (!file) {
      const error = new Error('No File')
      error.httpStatusCode = 400
      return next(error)
    }
    
    var fs = require("fs");


    //var data = fs.readFileSync("C:/service/555.jpg"); // I will get video frame from the client.
    //var base64 = data.toString("base64");
    //console.log(data);  //이미지 버퍼
    //console.log(base64);//버퍼 암호화
    
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
    };
    dat = {
        binary: file.buffer
    };

    //shell = new PythonShell.PythonShell ('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/flowerAnalysis.py', options, function (err) {
    let pyshell = new PythonShell.PythonShell('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/callLeaningModel/flowerAnalysis.py', options); 
    pyshell.send(JSON.stringify(dat), { mode: "json" })
    pyshell.on('message', function (results) { //But never receive data from pythonFile.
        //console.log(results)
        //var imgdata     = JSON.parse(results).img;
        var analyResult = JSON.parse(results);
        //console.log(imgdata);
        console.log(analyResult);
        //imbuffer = new Buffer.from(imgdata);
        //console.log(imbuffer);
        
        //local write
        //이미지를 로컬에 저장하여 확인해본다.
        //fs.writeFileSync("C:/service/pytonIMG.jpg", imbuffer);
        //console.log("complete"); 
        res.send( {results: analyResult});
    });
    pyshell.end(function (err) { // Just run it
        if (err)  throw err;
        console.log('finished'); //appear this message
    });
});



/*
    PythonShell을 이용한 ignore 협업 필터링 사용
    콘텐츠 간의 유사토를 측정 하여 추천 영화 top10을 반환
    참고 사이트 : https://big-dream-world.tistory.com/66
    direct 호출 rul 셈플 : http://localhost:5000/movieRecommended?id=315011

    100     10022   1002222
    "1",
    "0",
    "0       100",
    "1     10003",
    "2    100042",
    "3     10008",
    "4     10012",
    "5     10013",
    "6     10014",
    "7     10016",
    "8     10017",
    "9     10022",




    "0    10003",
    "1    10022",
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
    PythonShell.PythonShell.run ('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/test2.py', options, function (err, results) {

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
            
            //res.send( {results: results});     
        }
        //console.log('results: %j', results);
    });
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





/*
    ★ 민원 행정기관 처리 모듈 ★

    1. 경로의 엑셀파일에서 데이터 추출
    2. 주소 컬럼으로 주소API호출 
    3. 호출 결과를 조합하여 좌표API호출
    4. 주소와 좌표API 호출 결과를 엑셀파일로 추출
*/
const xlsx    = require('xlsx');            //데이터를 엑셀파일로 저장하기 위한 라이브러리
const request = require('request-promise'); //API요청을 위한 라이브러리
const JSONP   = require('node-jsonp');      //API요청을 JSONP로 받기 위한 라이브러리
const convert = require('xml-js');          //JSONP를 XML로 변환 시키기 위한 라이브러리
const axios   = require('axios');           //axios를 사용하기 위한 라이브러리
const https   = require('http');            //httpAgent(new https.Agent({ keepAlive: true })를 방지하기 위한 https 라이브러리

/*
    Axios 통신 실패시 재시도 관련 세팅 및 작업
*/
axios.defaults.retry = 4;
axios.defaults.retryDelay = 1000;

axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
    var config = err.config;
    // If config does not exist or the retry option is not set, reject
    if(!config || !config.retry) return Promise.reject(err);
    
    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0;
    
    // Check if we've maxed out the total number of retries
    if(config.__retryCount >= config.retry) {
        // Reject with the error
        return Promise.reject(err);
    }
    
    // Increase the retry count
    config.__retryCount += 1;
    
    // Create new promise to handle exponential backoff
    var backoff = new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, config.retryDelay || 1);
    });
    
    // Return the promise in which recalls axios to retry the request
    return backoff.then(function() {
        return axios(config);
    });
});

router.get("/minwonDataInit", async (req, res) => {
    
    const minwonResult = [];//엑셀에서 추출된 데이터
    let minwonSliceArr;

    fs.createReadStream('C:/Users/all4land/Desktop/결과없는 최종.csv', {encoding: 'utf8'})
    .pipe(csv())
    .on('data', (data) => minwonResult.push(data))
    .on('end', () => {
    
        //var start = 0;     var end = 2000;
        //var start = 2000;  var end = 4000;
        //var start = 4000;  var end = 6000;
        //var start = 6000;  var end = 8000;
        //var start = 8000;  var end = 10000;
        //var start = 10000; var end = 12000;
        //var start = 12000; var end = 14000;
        //var start = 14000; var end = 16000;
        //var start = 16000; var end = 18000;
        //var start = 18000; var end = 20000;
        //var start = 20000; var end = 22000;
        //var start = 22000; var end = minwonResult.length;
        var start = 0;       var end = minwonResult.length;

        minwonSliceArr = minwonResult.slice(start, end);

        const row = [];//엑셀로 추출될 데이터 배열
        var count = minwonSliceArr.length

        for(var i = 0 ; i < count ; i ++) {
            (async function(i) {
                
                await delay(50*i)//반복문 마다 0.1초씩 지연

                var doc1 = minwonSliceArr[i]

                var fclts_lclas_cd = String(doc1.fclts_lclas_cd); //기관코드1
                var fclts_mlsfc_cd = String(doc1.fclts_mlsfc_cd); //기관코드2
                var fclts_sclas_cd = String(doc1.fclts_sclas_cd); //기관코드3
                var bd_mgt_sn      = "";                          //건물번호
                var sig_cd         = "";                          //시군구코드
                var emd_cd         = "";                          //읍면동코드
                var rn_cd          = "";                          //도로명코드
                var rn_addr        = String(doc1.rn_addr);        //풀주소
                var pos_bul_nm     = String(doc1.pos_bul_nm);     //기관명
                var lc_x           = "";                          //좌표x
                var lx_y           = "";                          //좌표y
                var tel_cn         = String(doc1.tel_cn);         //전화번호
                var fax            = String(doc1.fax);            //팩스
                var hmpg_url       = String(doc1.hmpg_url);       //링크
                var use_yn         = String(doc1.use_yn);         //사용여부
                var reg_dt         = String(doc1.reg_dt);         //등록일자
            
                /* 좌표API호출을 위한 코드 */
                var admCd                //행정동 코드
                var udrtYn               //지하여부
                var rnMgtSn              //도로명코드
                var buldMnnm             //건물 본번
                var buldSlno             //건물 부번
            
                axios
                .get('http://www.juso.go.kr/addrlink/addrLinkApi.do?keyword='+encodeURI(doc1.rn_addr)+'&confmKey=U01TX0FVVEgyMDE3MDIxNzA5MjEwODE5MDg2&resultType=json&hstryYn=Y', {
                    timeout: 30000, 
                    httpsAgent: new https.Agent({ keepAlive: true }
                )})
                .then(response => {
                    (async function(i) {//소스의 순차적 실행을 위한 설정

                        jusoResult = response.data;

                        var status = jusoResult.results.common.errorMessage
                        var totCnt = jusoResult.results.common.totalCount

                        if(jusoResult.results.juso != null && totCnt != "0" ){
                            var doc2 = jusoResult.results.juso[0];

                            bd_mgt_sn   = doc2.bdMgtSn;             //건물번호
                            sig_cd      = doc2.rnMgtSn.substr(0,3); //시군구코드
                            emd_cd      = doc2.rnMgtSn.substr(3,2); //읍면동코드
                            rn_cd       = doc2.rnMgtSn.substr(5,7); //도로명코드

                            admCd       = doc2.admCd                //행정동 코드
                            udrtYn      = doc2.udrtYn               //지하여부
                            rnMgtSn     = doc2.rnMgtSn              //도로명코드
                            buldMnnm    = doc2.buldMnnm             //건물 본번
                            buldSlno    = doc2.buldSlno             //건물 부번
                        }
                        
                        let lc_x = "";
                        let lx_y = "";

                        await delay(10*i)//반복문 마다 0.1초씩 지연
                        JSONP ( 'http://www.juso.go.kr/addrlink/addrCoordApiJsonp.do?admCd='+admCd+'&rnMgtSn='+rnMgtSn+'&udrtYn='+udrtYn+'&buldMnnm='+buldMnnm+'&buldSlno='+buldSlno+'&confmKey=U01TX0FVVEgyMDIxMTAyNjE3MzMzOTExMTgwNjY=' , function ( json ) {
                        (async function(i) {
                             
                            var xmlToJson = convert.xml2json(json.returnXml, {compact: true, spaces: 4});
                            var jsonData  = JSON.parse(xmlToJson).results
                            var totalCnt =  jsonData.common.totalCount._text
                            var jusoData ;  //여러건일 경우 
                            
                            if(totalCnt == 1){
                                jusoData = jsonData.juso

                                lc_x = jusoData.entX._text;
                                lx_y = jusoData.entY._text;
                            }
                            else if (totalCnt != 0){
                                jusoData = jsonData.juso[0]

                                lc_x = jusoData.entX._text;
                                lx_y = jusoData.entY._text;
                            }
                            else {
                                lc_x = "";
                                lx_y = "";
                            }
                            
                            var postData = {
                                fclts_lclas_cd : fclts_lclas_cd,        //기관코드1
                                fclts_mlsfc_cd : fclts_mlsfc_cd,        //기관코드2
                                fclts_sclas_cd : fclts_sclas_cd,        //기관코드3
                                bd_mgt_sn      : "'"+String(bd_mgt_sn), //건물번호
                                sig_cd         : "'"+String(sig_cd),    //시군구코드
                                emd_cd         : "'"+String(emd_cd),    //읍면동코드
                                rn_cd          : "'"+String(rn_cd),     //도로명코드
                                rn_addr        : rn_addr,               //풀주소
                                pos_bul_nm     : pos_bul_nm,            //기관명
                                lc_x           : "'"+String(lc_x),      //좌표x
                                lc_y           : "'"+String(lx_y),      //좌표y
                                tel_cn         : "'"+String(tel_cn),    //전화번호
                                fax            : "'"+String(fax),       //팩스
                                hmpg_url       : hmpg_url,              //링크
                                use_yn         : use_yn,                //사용여부
                                reg_dt         : "",                    //등록일자
                                updt_dt        : ""                     //수정일자        
                            };
                            
                            
                            row.push(postData);
                            
                            console.log(row.length + "     " + minwonSliceArr.length + "    "+minwonResult.length);

                            if(row.length === minwonSliceArr.length) {   
                                
                                makeExcel(row , start+"~"+end)
                                res.json({data : row});
                                return false
                            }
                        })(i);
                        })    
                    })(i);
                })
                .catch(error => { 
                    console.error(error);
                });
            })(i);
        }
    });
});

//시간 지연 (반복문의 경우 시간 * 반복문의 인덱스 i 를 곱하여 호출) 참고 : https://stackoverflow.com/questions/30676849/delay-between-api-calls-nodejs
function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1);
    });
}

/*
    배열 과 파일명을 파라메터로 받아 엘셀파일로 추출
*/
function makeExcel(rows, fileNum){
    console.log("<COPY START>");
    const workSheet = xlsx.utils.json_to_sheet(rows);

    // csv로 저장하는 경우
    const stream = xlsx.stream.to_csv(workSheet);
    stream.pipe(fs.createWriteStream('C:/Users/all4land/Desktop/test_'+fileNum+'.csv'));
    console.log("<COPY END>");
}


module.exports = router;