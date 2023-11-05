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
 * @author 영화 상세정보 컨트롤러
**/
router.get("/geomboardSave", async (req, res) => {

    console.log("진입완료!!!!!!");
    
    var geom = JSON.parse(req.query.geom).features;
    console.log(geom);
    

    geom.forEach((doc) => {
        console.log(doc.type);
        console.log(JSON.stringify(doc.geometry));
        let state = doc.properties.state;

        if(state == "insert"){

            var modelClassDoc = db.collection("geom_board_list").doc();
            
            var postData = {
                id            : modelClassDoc.id,
                geom_type     : doc.geometry.type,
                geom_value    : JSON.stringify(doc.geometry),
                geom_prop     : JSON.stringify(doc.properties),
                reg_dt        : Date.now(),
                last_state    : "insert",
            };
            modelClassDoc.set(postData);
        }
        else if(state == "update"){

            var modelClassDoc = db.collection("geom_board_list").doc(doc.id);
            
            var postData = {
                id            : doc.id,
                geom_type     : doc.geometry.type,
                geom_value    : JSON.stringify(doc.geometry),
                geom_prop     : JSON.stringify(doc.properties),
                reg_dt        : Date.now(),
                last_state    : "update",
            };
            modelClassDoc.set(postData);
        }
    });
    res.send({rows: "등록완료"});
});

/**
 * @author 영화 리스트 컨트롤러
**/
router.get("/geomboardList", async (req, res) => {

    console.log("진입완료!!!!!!");

    commonUtil.getFirebaseDB().collection('geom_board_list').orderBy('reg_dt', "desc").get()
        .then((snapshot) => {
            var rows = [];
            snapshot.forEach((doc) => {
                var childData = doc.data();
                //새로운 게시물(하루전), 업데이트된(하루전) 게시물 세팅
                const today      = new Date();
                const regDate    = new Date(Number(childData.reg_dt));

                const refNewDate = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate() +1 ,regDate.getHours(), regDate.getMinutes(), regDate.getSeconds(), regDate.getMilliseconds() );

                childData.doc_id = childData.id;//페이징 처리를 위함 

                rows.push(childData);
            });
            res.send({rows: rows});
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
});


module.exports = router;