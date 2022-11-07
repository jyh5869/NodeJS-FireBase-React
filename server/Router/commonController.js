const express = require("express");
const router  = express.Router();

const commonUtil = require("./common.js");

const fs          = commonUtil.getFileStreamObj();
const csv         = commonUtil.getReadCSVObj();
const PythonShell = commonUtil.getPythonShellObj();





/**
 * @author 추천 영화 머신러닝 예제 컨트롤러
 * @author 1. 참조링크1 : https://proinlab.com/archives/2103
 * @author 2. 참조링크2 : https://www.npmjs.com/package/nodeml
 * @author 3. User-based CF (ex > 넷플릭스 : 사용자의 시청 영화에 따라 영화 추천 )
**/
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

    res.send({test : "hi"});
});


/**
 * @author  민원 행정기관 처리 모듈
 * @author  1. 경로의 엑셀파일에서 데이터 추출
 * @author  2. 주소 컬럼으로 주소API호출 
 * @author  3. 호출 결과를 조합하여 좌표API호출
 * @author  4. 주소와 좌표API 호출 결과를 엑셀파일로 추출
**/
const xlsx    = require('xlsx');            //데이터를 엑셀파일로 저장하기 위한 라이브러리
const request = require('request-promise'); //API요청을 위한 라이브러리
const JSONP   = require('node-jsonp');      //API요청을 JSONP로 받기 위한 라이브러리
const convert = require('xml-js');          //JSONP를 XML로 변환 시키기 위한 라이브러리
const axios   = require('axios');           //axios를 사용하기 위한 라이브러리
const https   = require('http');            //httpAgent(new https.Agent({ keepAlive: true })를 방지하기 위한 https 라이브러리


//Axios 통신 실패시 재시도 관련 세팅 및 작업
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



/**
 * @author 민원 행정기관 처리 컨트롤러
**/
router.get("/minwonDataInit", async (req, res) => {
    
    const minwonResult = [];//엑셀에서 추출된 데이터
    let minwonSliceArr;

    fs.createReadStream('C:/Users/all4land/Desktop/결과없는 최종.csv', {encoding: 'utf8'})
    .pipe(csv())
    .on('data', (data) => minwonResult.push(data))
    .on('end', () => {
        
        /* 지속적으로 요청시 컴포넌트 조기 종료 발생시 총건수를 나눠서 진행 */
        var start = 0;       var end = minwonResult.length;
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
                var admCd          //행정동 코드
                var udrtYn         //지하여부
                var rnMgtSn        //도로명코드
                var buldMnnm       //건물 본번
                var buldSlno       //건물 부번
            
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


/**
 * @author 시간 지연 함수(반복문의 경우 시간 * 반복문의 인덱스 i 를 곱하여 호출)
 * @author 참고 URL : /https://stackoverflow.com/questions/30676849/delay-between-api-calls-nodejs
 * @param  n : 반복문의 인덱스 
 * @return 시간지연 함수
**/
function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1);
    });
}


/** 
 * @author 배열과 파일명을 파라메터로 받아 엘셀파일로 추출하는 함수
 * @param  rows    데이터 배열 
 * @param  fileNum 파일명 체번
**/
function makeExcel(rows, fileNum){
    console.log("<COPY START>");
    const workSheet = xlsx.utils.json_to_sheet(rows);

    // csv로 저장하는 경우
    const stream = xlsx.stream.to_csv(workSheet);
    stream.pipe(fs.createWriteStream('C:/Users/all4land/Desktop/test_'+fileNum+'.csv'));
    console.log("<COPY END>");
}


/**
 * @author 영화 리뷰를 분석하여 긍정 & 부정 판단 컨트롤러
**/
router.get("/videoDeep", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };

    PythonShell.PythonShell.run ('Router/leaningModel/humanActionDeepLearning.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{

            resultArr = []

            res.send( {results: results});     
        }
    });    
});





module.exports = router;