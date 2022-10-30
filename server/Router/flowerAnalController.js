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

const commonUtil = require("./common.js");

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

/*
const saveModelNm   = 'model_flw';
const datasetUrl    = 'C:/Users/all4land/.keras/datasets/flower_photos';
const reulstImgPath = 'C:/Users/all4land/.keras/trainingResImg/'
const saveModelUrl  = 'C:/Users/all4land/.keras/model/'
*/

const saveModelNm   = 'model_flw';
const datasetUrl    = 'D:/Development/DeveloperKits/Tensorflow/datasets/flower_photos';
const reulstImgPath = 'D:/Development/DeveloperKits/Tensorflow/trainingResImg/'
const saveModelUrl  = 'D:/Development/DeveloperKits/Tensorflow/model/'



/*  이미지 학습에제1  */
router.get("/imageDeepLeaning1", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };

    PythonShell.PythonShell.run ('Router/leaningModel/imageDeepLearningType1.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{

            res.send( {results: results});     
        }
    });
    
});

/*  이미지 학습 예제 2  */
router.get("/imageDeepLeaning2", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };

    PythonShell.PythonShell.run ('Router/leaningModel/imageDeepLearningType2.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{

            res.send( {results: results});     
        }
    });
});


/* 실제 모델을 사용하여 이미지를 분석하는 컨트롤러  */
router.post("/flowerAnalysis", upload.single('file'),  (req, res,  next) => {

    const file = req.file;//Multer를 이용한 파일 객체
    
    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        return next(error)
    }
    
    var fs = require("fs");
    
    //파이썬 쉘 요청 옵션
    var options = {
        mode         : 'text',
        pythonPath   : '',
        pythonOptions: ['-u'],
        scriptPath   : '',
        args         : [saveModelUrl, 'value2'],
    };

    data = { binary: file.buffer };
    //data = { binary: file.buffer.toString("base64")};

    //파이썬 쉘 생성, 요청 및 응답
    let pyshell = new PythonShell.PythonShell('Router/callLeaningModel/flowerAnalysis.py', options); 
    pyshell.send(JSON.stringify(data), { mode: "json" })
    pyshell.on('message', function (results) {
        
        var imgdata     = JSON.parse(results).img;
        var analyResult = JSON.parse(results).result;
        var anaImg = JSON.parse(results).anaImg;
        //console.log(anaImg)

        //이미지 로컬 저장
        imbuffer = new Buffer.from(imgdata);
        fs.writeFileSync(reulstImgPath + "validationIMG.jpg", imbuffer);
        
        console.log("complete"); 
        res.send( {results: analyResult});
    });
    pyshell.end(function (err) {
        if (err)  throw err;
        console.log('finished');
    });
});



/*  모델 분류결과 대상의 사전의미 크롤링 컨트롤러  */
router.get("/crawlingGoogle", async  (req, res,  next) => {

    var keyword = req.query.keyword

    //파이썬 쉘 요청 옵션
    var options = {
        mode         : 'text',
        pythonPath   : '',
        pythonOptions: ['-u'],
        scriptPath   : '',
        args         : [keyword],
        encoding : 'utf8',
    };
    
    //파이썬 쉘 생성, 요청 및 응답
    let pyshell = new PythonShell.PythonShell('Router/pythonCommon/crawlingGoogle.py', options); 
    pyshell.send(keyword, { mode: "text" })
    pyshell.on('message', function (results) {

        res.json( {results: results});
    })
    pyshell.end(function (err) {
        if (err)  {throw err};
        console.log('finished');
    });
});


/*  분류 결과 값의 사육법 크롤링 컨트롤러  */
router.get("/crawlingGoogleGrwFlw",async  (req, res,  next) => {

    var keyword = req.query.keyword

    //파이썬 쉘 요청 옵션
    var options = {
        mode         : 'text',
        pythonPath   : '',
        pythonOptions: ['-u'],
        scriptPath   : '',
        args         : [keyword],
        encoding : 'utf8',
    };
    
    //파이썬 쉘 생성, 요청 및 응답
    let pyshell = new PythonShell.PythonShell('Router/pythonCommon/crawlingGoogleGrwFlw.py', options); 
    pyshell.send(keyword, { mode: "text" })
    pyshell.on('message', function (results) {
         
        docList = [];

        var resultArray = JSON.parse(results)
        resultArray.forEach((doc) => {

            jsonData = JSON.parse(doc);
            docList.push(jsonData)
        }); 
        
        res.json( {results : docList});
    })
    pyshell.end(function (err) {
        if (err)  {throw err};
        console.log('finished!!');
    });
});


/*  모델 훈련 호출 컨트롤러 */
router.get("/FlwDeepLearningNewClass", async  (req, res,  next) => {

    let saveModelNmReq   = req.query.keyword       != undefined ? req.query.keyword       : saveModelNm;
    let datasetUrlReq    = req.query.saveModelNm   != undefined ? req.query.saveModelNm   : datasetUrl;
    let reulstImgPathReq = req.query.reulstImgPath != undefined ? req.query.reulstImgPath : reulstImgPath
    let saveModelUrlReq  = req.query.saveModelUrl  != undefined ? req.query.saveModelUrl  : saveModelUrl

    const promise1 = new Promise(async (resolve, reject)  => {
        let results = await FlwDeepLearningNewClass(saveModelNmReq, datasetUrlReq, reulstImgPathReq, saveModelUrlReq)
        .then(function(){
            resolve(results); // resolve 가 실행이 되면 밑에 .then 이 실행이 됨
            console.log("then!");
            console.log(results)
        })
        .catch(() => {
            console.log("catch!");
            reject()
        });

    })
    promise1.then((results) => {
            console.log("then!");
            res.send({results: results});
        })
        .catch(() => {
            console.log("catch!");
            res.send({results: 'error'});
        });
          
});


/* 모델 훈련 클래스 리스트 조회 및 변경 컨트롤러 */
router.get("/flwNewClass", async (req, res) => {
    
    const label_name_eng = ['cosmos', 'daisy', 'dandelion', 'forsythia', 'myosotis', 'roses', 'sunflowers', 'tulips']
    const label_name_kor = ['코스모스', '데이지', '민들레', '개나리', '물망초', '장미', '해바라기속', '튤립']
    
    let callType = req.query.callType;

    if(callType == 'insert'){
        var modelClassDoc = db.collection("model_class_list").doc();
        var postData = {
            id            : modelClassDoc.id,
            model_nm      : req.query.modelNm,
            class_eng_nm  : req.query.engNm,
            class_kor_nm  : req.query.korNm,
            use_yn        : "Y",
            train_dt      : "",
            reg_dt        : Date.now(),
        };
        modelClassDoc.set(postData);
        res.send({rows: "등록완료"});
    }
    else if(callType == 'select'){

        //리스트 호출 전 클래스별 훈련데이터 존재 유무를 파악 하여 없을 경우 훈련 일자를 초기화 함(구동 환경에 구애 받지않기 위함) 
        await db.collection('model_class_list').orderBy('reg_dt', "desc").get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                var childData = doc.data();
                
                fs.exists(datasetUrl+"/"+childData.class_kor_nm, function(exists) {
                    if(!exists){
                        boardDoc = db.collection("model_class_list").doc(childData.id);
                        boardDoc.update({ train_dt : ""})
                    }
                });
            });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });

        await db.collection('model_class_list').orderBy('reg_dt', "desc").get()
        .then((snapshot) => {
            var rows = [];
            snapshot.forEach((doc) => {
                var childData = doc.data();
                //새로운 게시물(하루전), 업데이트된(하루전) 게시물 세팅
                const today      = new Date();
                const regDate    = new Date(Number(childData.reg_dt));
                const traingDate = new Date(Number(childData.train_dt));

                const refNewDate = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate() +1 ,regDate.getHours(), regDate.getMinutes(), regDate.getSeconds(), regDate.getMilliseconds() );
                const refUpdDate = new Date(traingDate.getFullYear(), traingDate.getMonth(), traingDate.getDate() +1 ,traingDate.getHours(), traingDate.getMinutes(), traingDate.getSeconds(), traingDate.getMilliseconds());

                childData.newRegYn    = today <= refNewDate ? "Y" : "N";
                childData.newtrainYn  = today >= traingDate && childData.train_dt != "" ? "Y" : "N";

                childData.train_dt  = dateFormat(traingDate , "yyyy-mm-dd hh:MM:ss");
                childData.reg_dt    = dateFormat(regDate    , "yyyy-mm-dd hh:MM:ss");

                rows.push(childData);
            });
            res.send({rows: rows});
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
    }
    else if(callType == 'modify'){
        let targetId = req.query.targetId;
        let targetVal = req.query.targetVal;

        let returnStr = "";
        boardDoc = db.collection("model_class_list").doc(targetId);

        await boardDoc.update({
            use_yn     : targetVal,
        }).then(function() {
            returnStr = "Class Update Success";
        })
        .catch(function(error) {
            returnStr = "Class Update Fail----->" + error;
            
        });

        res.send({results: returnStr});
        
    }
    else if(callType == 'delete'){

        let targetId  = req.query.targetId;
        let returnStr = "";

        //훈련 이미지 데이터 삭제
        console.log(targetId);
        await  db.collection('model_class_list').where('id', '==', targetId ).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                let dirNm = doc.data().class_kor_nm;
                deleteall(datasetUrl + '/' + dirNm)
            });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });

        //데이터 삭제  
        await db.collection('model_class_list').doc(targetId).delete()
        .then(function() {
            returnStr = "Class Delete Success";
        })
        .catch(function(error) {
            returnStr = "Class Delete Fail----->" + error;
        });
        
        res.send({results: returnStr});
    }
    else{
        res.send({rows: "등록완료"});
    }
    
});


/* 모델 훈련결과 리스트 호출 및 변경 컨트롤러 */
router.get("/getTrainingHist", async (req, res) => {
    
    let callType     = req.query.callType;
    let type         = req.query.type
    let docId        = req.query.doc_id
    let collectionNm = "model_class_list"

    commonUtil.getTargetSnaphot(docId, collectionNm, type, 10)
        .then(function(snapshot){
            console.log(snapshot)
        });        
    
    if(callType == 'select'){
        await db.collection('model_trn_hist').orderBy('id', "desc").get()
        .then((snapshot) => {
            var rows = [];
            snapshot.forEach((doc) => {
                var childData = doc.data();
                //새로운 게시물(하루전), 업데이트된(하루전) 게시물 세팅
                const today      = new Date();
                const regDate    = new Date(Number(childData.id));
                const strDate    = new Date(Number(childData.start_dt));
                const endDate    = new Date(Number(childData.end_dt));

                const refNewDate = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate() +1 ,regDate.getHours(), regDate.getMinutes(), regDate.getSeconds(), regDate.getMilliseconds() );

                childData.newRegYn  = today <= refNewDate ? "Y" : "N";
                
                childData.reg_dt1   = dateFormat(Number(regDate)  ,"yyyy-mm-dd");
                childData.reg_dt2   = dateFormat(Number(regDate)   ,"yyyy-mm-dd hh:MM:ss");

                childData.start_dt  = childData.start_dt != null ? dateFormat(Number(strDate)   ,"yyyy-mm-dd hh:MM:ss") : '-';
                childData.end_dt    = childData.end_dt   != null ? dateFormat(Number(endDate)   ,"yyyy-mm-dd hh:MM:ss") : '-';

                childData.down_status_summary = childData.down_status == 'Success' ? 'Success' : 'Fail' 
                childData.load_status_summary = childData.load_status == 'Success' ? 'Success' : 'Fail' 
                childData.training_status_summary = childData.training_status == 'Success' ? 'Success' : 'Fail' 

                rows.push(childData);
            });
            res.send({rows: rows});
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
    }
    else if(callType == 'delete'){

        let targetId = req.query.targetId;
        let returnStr = "";

         //해당 데이터 삭제
         await db.collection('model_trn_hist').doc(targetId).delete()
         .then(function() {
            returnStr = "Class Delete Success";
         })
         .catch(function(error) {
            returnStr = "Class Delete Fail----->" + error;
         });
  
        res.send({results: returnStr});
    }
    else{
        res.send({results: 'error'});
    }
    
});


/*  
    모델 저장 디렉토리에 해당 모델 존재여부 확인 
    모델이 없을 경우 생성 컨트롤러 호출 or 생성 안내 문구 표출   
*/
router.get("/getModelExistYn",async  (req, res,  next) => {

    var modelNm = req.query.modelNm

    var exists = fs.existsSync(saveModelUrl + modelNm + ".h5")

    res.send( {results: exists});

});


/* 로컬 경로의 이미지 호출 컨트롤러 */
router.get("/getImgs",async  (req, res,  next) => {
    //호출 경로
    var path = req.query.path

    fs.readFile(path, function(error, data){
        res.writeHead(200,{'Content-Type' : 'text/html'});
        res.end(data);
    });
});



/* 파이썬 쉘 테스트 컨트롤러 */
router.get("/test",async  (req, res,  next) => {

    var options2 = {
        mode         : 'text',
        pythonPath   : '',
        pythonOptions: ['-u'],
        scriptPath   : '',
        args         : [saveModelNm, datasetUrl, reulstImgPath, saveModelUrl, 'Success'],
        encoding : 'utf8',
    };

    PythonShell.PythonShell.run ('Router/leaningModel/01.test.py', options2, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{
            res.send( {results: results});
        }
    });

});


/** 
 *  디렉토리 삭제 함수 : 파일들을 일괄 삭제 후 디렉토리 삭제
 *  @param path   삭제할 경로
 */
function deleteall(path) {
	var files = [];
	if(fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			var curPath = path + "/" + file;
			if(fs.statSync(curPath).isDirectory()) { // recurse
				deleteall(curPath);
			} 
            else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};


/** 
 *  모델 훈련을 위한 배치 함수
 *  @param saveModelNm   저장될 모델명
 *  @param datasetUrl    훈련데이터 경로
 *  @param reulstImgPath 훈련결과 이미지 저장경로 
 *  @param saveModelUrl  훈련 모델 저장경로
 */
async function FlwDeepLearningNewClass (saveModelNm, datasetUrl, reulstImgPath, saveModelUrl){
    
    let dwonStatus;//크롤링 결과 변수 (Success, Fail)

    //모델 훈련전 클레스의 훈련데이터 존재유무 파악 및 없을경우 훈련데이터를 수집하도록 세팅
    await db.collection('model_class_list').orderBy('reg_dt', "desc").get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                var childData = doc.data();
                
                fs.exists(datasetUrl+"/"+childData.class_kor_nm, function(exists) {
                    if(!exists){
                        boardDoc = db.collection("model_class_list").doc(childData.id);
                        boardDoc.update({ train_dt : ""})
                    }
                });
            });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
        
    //파이썬 쉘 요청 옵션
    var options1 = {
        mode         : 'text',
        pythonPath   : '',
        pythonOptions: ['-u'],
        scriptPath   : '',
        args         : [datasetUrl],
        encoding : 'utf8',
    };

    //훈련안된 클레스를 쿼리하여 이미지 다운 후 훈련 하고 이미지 분류 오류 수정(파이썬 버전차이로 추측)
    let pyshell = await new PythonShell.PythonShell('Router/pythonCommon/loadDeepLearningData.py', options1); 
    pyshell.send(datasetUrl, { mode: "text" })
    pyshell.on('message', function (results) {
        //console.log(results);        
    })
    pyshell.end(function (err) {
        if (err)  {
            dwonStatus = 'Fail'
            throw err
        }
        else{
            dwonStatus = 'Success'
        }

        var options2 = {
            mode         : 'text',
            pythonPath   : '',
            pythonOptions: ['-u'],
            scriptPath   : '',
            args         : [saveModelNm, datasetUrl, reulstImgPath, saveModelUrl, dwonStatus],
            encoding : 'utf8',
        };
        //모델 훈련
        PythonShell.PythonShell.run ('Router/leaningModel/FlwDeepLearningNewClass.py', options2, function (err, results) {

            if (err) {
                console.log(err);           
            }   
            else{
                
            }
        });
    });    
}


/**
 *  모델 훈련 배치 작업을 위한 스케쥴러 설정
 *  1. 매일 새벽 일정시간에 훈련 진행
 *  2. 훈련 데이터 디렉토리 조회 후 없을 경우 데이터를 세팅 할 수 있도록 설정
 *  3. 훈련데이터 생성이 필요한 클래스들을 조회 후 훈련 데이터 생성(클래스 활성화 여부, 디렉토리 유무)
 *  4. 해당 클래스를 대상으로 모델 훈련
 *  5. 훈련 이력 및 데이터를 저장 (수치 and 이미지 그래프) 
 */
const schedule = require('node-schedule');//스케줄러 사용을 위한 라이브러리
const app      = express()
app.listen(6000, (request, response, next) => {
    console.log('Example app listening on port 6000')
    const trainingModelBatch = schedule.scheduleJob('1 27 1 * * *', function(requestTime){
        console.log(requestTime + ' 딥러닝 모델 훈련 배치 시작');
        const results = FlwDeepLearningNewClass(saveModelNm, datasetUrl, reulstImgPath, saveModelUrl)
        console.log(requestTime + ' 딥러닝 모델 훈련 배치 종료');
    });
})





module.exports = router;