const express = require("express");
const router  = express.Router();

const commonUtil = require("./common.js");

const db          = commonUtil.getFirebaseDB();
const fs          = commonUtil.getFileStreamObj();
const dateFormat  = commonUtil.getDataFormatObj();
const upload      = commonUtil.getUploadObj();
const PythonShell = commonUtil.getPythonShellObj();
const userIp      = commonUtil.getUserIp();

let saveModelNm   = commonUtil.getModelInfo("saveModelNm");
let datasetUrl    = commonUtil.getModelInfo("datasetUrl");
let reulstImgPath = commonUtil.getModelInfo("reulstImgPath");
let saveModelUrl  = commonUtil.getModelInfo("saveModelUrl");





/**
 * @author 이미지 학습 예제 컨트롤러1
**/
router.get("/imageDeepLeaning1", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };

    PythonShell.PythonShell.run ('Router/sampleModel/imageDeepLearningType1.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{

            res.send( {results: results});     
        }
    });
    
});

/**
 * @author 이미지 학습 예제 컨트롤러2
**/
router.get("/imageDeepLeaning2", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };

    PythonShell.PythonShell.run ('Router/sampleModel/imageDeepLearningType2.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{

            res.send( {results: results});     
        }
    });
});


/**
 * @author 실제 모델을 사용하여 이미지를 분석하는 컨트롤러
**/
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


/**
 * @author 모델 분류결과 대상의 사전의미 크롤링 컨트롤러
**/
router.get("/crawlingGoogle", async (req, res,  next) => {

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


/**
 * @author 분류 결과 값의 사육법 크롤링 컨트롤러
**/
router.get("/crawlingGoogleGrwFlw", async (req, res,  next) => {

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


/**
 * @author 모델 훈련 호출 컨트롤러
**/
router.get("/FlwDeepLearningNewClass", async  (req, res,  next) => {

    let saveModelNmReq   = req.query.keyword       != undefined ? req.query.keyword       : saveModelNm;
    let datasetUrlReq    = req.query.saveModelNm   != undefined ? req.query.saveModelNm   : datasetUrl;
    let reulstImgPathReq = req.query.reulstImgPath != undefined ? req.query.reulstImgPath : reulstImgPath
    let saveModelUrlReq  = req.query.saveModelUrl  != undefined ? req.query.saveModelUrl  : saveModelUrl

    const promise = new Promise(async (resolve, reject)  => {
        let results = await FlwDeepLearningNewClass(saveModelNmReq, datasetUrlReq, reulstImgPathReq, saveModelUrlReq)
        .then(function(){
            resolve(results);
            console.log("then!");
            console.log(results)
        })
        .catch(() => {
            console.log("catch!");
            reject()
        });
    })    
});


/**
 * @author Previous 핸들러 샘플
 * @param {*} req  request 
 * @param {*} res  response
 * @param {*} next next
 */
const handler1 = function (req, res, next) {
    //console.log('handler1')
    next()
}
const handler2 = function (req, res, next) {
    //console.log('handler2')
    next()
}
  

/**
 * @author 모델 훈련 클래스 리스트 조회 및 변경 컨트롤러
**/
router.get("/flwNewClass", [handler1, handler2], async (req, res) => {

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

        let docId        = req.query.docId;
        let collectionNm = "model_class_list"; 
        let type         = req.query.type; 
        let modelNm      = req.query.modelNm == undefined ? undefined : req.query.modelNm
        let operator     = req.query.modelNm == undefined ? 'not-in' : 'in'
        let value        = [modelNm]
        let column       = 'model_nm'

        //리스트 호출 전 클래스별 훈련데이터 존재 유무를 파악 하여 없을 경우 훈련 일자를 초기화 함(구동 환경에 구애 받지않기 위함)
        await commonUtil.getFirebaseDB().collection('model_class_list').orderBy('reg_dt', "desc").get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                var childData = doc.data();

                fs.exists(datasetUrl+"/"+childData.class_kor_nm, function(exists) {
                    boardDoc = commonUtil.getFirebaseDB().collection("model_class_list").doc(childData.id);
                    
                    if(!exists){    
                        boardDoc.update({ train_dt : ""})
                    }
                    else{
                        boardDoc.update({ train_dt : Date.now()})
                    }
                });
            });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
        
        await commonUtil.getTargetSnaphot(docId, collectionNm, type, 10, column, operator, value)
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

                childData.doc_id = childData.id;//페이징 처리를 위함 

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


/**
 * @author 모델 리스트 조회 컨트롤러
**/
router.get("/getModelList", async (req, res) => {
    
    //파라메터 세팅
    let docId        = undefined;
    let type         = undefined;
    let countPerPage = undefined;
    let collectionNm = "model_list"; 
    let column       = 'use_yn';
    let operator     = '==';
    let value        = 'Y';

    let rows = [];
    
    //리스트 조회
    await commonUtil.getTargetSnaphot(docId, collectionNm, type, countPerPage, column, operator, value)
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            var childData = doc.data();
            rows.push(childData);
        });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
    
    //응답
    res.send({results: rows});
});


/**
 * @author 모델 훈련결과 리스트 호출 및 변경 컨트롤러
**/
router.get("/getTrainingHist", async (req, res) => {
    
    let callType     = req.query.callType;
    let type         = req.query.type
    let docId        = req.query.docId
    let collectionNm = "model_trn_hist"  
    
    if(callType == 'select'){
        await commonUtil.getTargetSnaphot(docId, collectionNm, type, 10)
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

                childData.doc_id = childData.id;//페이징 처리를 위함 

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


/**
 * @author 모델 저장 디렉토리에 해당 모델 학습데이터 존재여부 확인
 * @author 모델이 없을 경우 생성 컨트롤러 호출 or 생성 안내 문구 표출
**/
router.get("/getModelExistYn",async  (req, res,  next) => {

    var modelNm = req.query.modelNm

    var exists = fs.existsSync(saveModelUrl + modelNm + ".h5")

    res.send( {results: exists});

});


/**
 * @author 로컬 경로의 이미지 호출 컨트롤러
**/
router.get("/getImgs",async  (req, res,  next) => {
    //호출 경로
    var path = req.query.path

    fs.readFile(path, function(error, data){
        res.writeHead(200,{'Content-Type' : 'text/html'});
        res.end(data);
    });
});


/**
 * @author 파이썬 쉘 테스트 컨트롤러
**/
router.get("/test",async  (req, res,  next) => {

    var options2 = {
        mode         : 'text',
        pythonPath   : '',
        pythonOptions: ['-u'],
        scriptPath   : '',
        args         : [saveModelNm, datasetUrl, reulstImgPath, saveModelUrl, 'Success'],
        encoding : 'utf8',
    };

    PythonShell.PythonShell.run ('Router/leaningModel/reviewDeepLearning2.py', options2, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{
            res.send( {results: results});
        }
    });

});


/**
 * @author 텐서플로를 이용한 오디오 파일 인식 및 훈련 컨트롤러
**/
router.get("/audioDeepLearning", (req, res) => {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: ["vlaue1", 'value2'],
        encoding : 'utf8'
    };

    PythonShell.PythonShell.run ('Router/sampleModel/audioDeepLearningType1.py', options, function (err, results) {

        if (err) {
            console.log(err);           
        }   
        else{
            resultArr = []
            res.send( {results: results});     
        }
    });    
});


/** 
 * @author 디렉토리 삭제 함수 : 파일들을 일괄 삭제 후 디렉토리 삭제
 * @param  path : 삭제할 경로
 * @returns
**/
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
 *  @author 모델 훈련을 위한 배치 함수
 *  @param saveModelNm   저장될 모델명
 *  @param datasetUrl    훈련데이터 경로
 *  @param reulstImgPath 훈련결과 이미지 저장경로 
 *  @param saveModelUrl  훈련 모델 저장경로
 */
async function FlwDeepLearningNewClass (saveModelNm, datasetUrl, reulstImgPath, saveModelUrl){

    let dwonStatus;//크롤링 결과 변수 (Success, Fail)
    //모델 훈련전 클레스의 훈련데이터 존재유무 파악 및 없을경우 훈련데이터를 수집하도록 세팅
    await commonUtil.getTargetSnaphot(undefined, 'model_class_list', undefined, undefined, 'model_nm', '==', saveModelNm)
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                var childData = doc.data();
                
                fs.exists(datasetUrl+"/"+childData.class_kor_nm, function(exists) {
                    boardDoc = db.collection("model_class_list").doc(childData.id);
                    
                    if(!exists){    
                        boardDoc.update({ train_dt : ""})
                    }
                    else{
                        console.log("경로 있다!"+datasetUrl+"/"+childData.class_kor_nm);
                        boardDoc.update({ train_dt : Date.now()})
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
        args         : [datasetUrl, saveModelNm],
        encoding : 'utf8',
    };
    await commonUtil.getDelay(2000*1)
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
**/
const schedule = require('node-schedule');//스케줄러 사용을 위한 라이브러리
const app      = express()
app.listen(6000, (request, response, next) => {
    console.log('Example app listening on port 6000')
    const trainingModelBatch = schedule.scheduleJob('1 10 * * * *',async function(requestTime){
    //const trainingModelBatch = schedule.scheduleJob('1 * * * * *',async function(requestTime){

        let rows = [];
        //리스트 조회
        await commonUtil.getTargetSnaphot(undefined, 'model_list', undefined, undefined, 'use_yn', '==', 'Y')
        .then(async(snapshot) => {
            
            snapshot.forEach((doc) => {
                var childData = doc.data();
                rows.push(childData); 
                console.log(childData.model_nm);
            });

            //900초 15분 = 900000
            for(var i = 0; i < rows.length; i++) {
                
                await commonUtil.getDelay(900000*i).then(() => {   
                    console.log("모델 훈련 배치 시작: " + rows[i].model_nm + " / " + new Date());
                    
                    let saveModelNmDetail = rows[i].model_nm;
                    let datasetUrlDetail = datasetUrl + '/' + saveModelNmDetail;
                    
                    FlwDeepLearningNewClass(saveModelNmDetail, datasetUrlDetail, reulstImgPath, saveModelUrl)
                });
            }
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
    });
})





module.exports = router;