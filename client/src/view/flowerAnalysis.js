

import React, { useEffect, useState } from "react";
import { Card, Button,Table,Form  }   from 'react-bootstrap';
import axios from 'axios';

const content_files = new Array();
const formData = new FormData();//이미지 데이터 저장 Form

function ProdList() {

    const [list , setList] = useState([]);
    const [obj  , setObj ] = useState([]);
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];

    const [imageSrc, setImageSrc] = useState('');


    //이미지가 등록 될시 미리보기 기능 제공
    const encodeFileToBase64 = (e) => {
        
        const reader = new FileReader();
        

        const fileBlob = e.target.files[0]
        const uploadFile = fileBlob
        //console.log(uploadFile);

        formData.append('file', uploadFile)
        formData.append('title', "분류할 꽃입니다.")
        content_files.push(uploadFile);

        console.log("업로드할때")
        console.log(formData.get('file'))//파일저장 폼
        console.log(content_files);//파일 저장 배열

        reader.readAsDataURL(uploadFile);

        return new Promise((resolve) => {

            reader.onload = () => {
                setImageSrc(reader.result);
                resolve();
            };  
        });
    };

    //업로드된 이미지로 분류 컨트롤러 호출 Axios
    const getFlowerAnalyResult = async () => {

        //let response = await axios.get('/api/flowerAnalysis');
        
        console.log("전송할때")
        console.log(formData.get('file'))//파일저장 폼
        console.log(content_files);

        let response = await axios({
            method: 'post',
            url: '/api/flowerAnalysis',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        });
        document.getElementById('analysisResult').value = "분석 완료"
        setObj(response);
        console.log(response);
    }



    function handleSubmit(e) {
        
        getFlowerAnalyResult();

        e.preventDefault();
        console.log('You clicked submit.');
    }
    

    //페이지 로드 후 즉각 실행
    useEffect(() => {
        //getFlowerAnalyResult();
    },  []);

    
    //JSX 식으로 리스트 파싱
    return (
        <React.Fragment  >
            {/* <h1>Our new Products</h1> */}        
            <div className="my-5 mx-1">
            <Form >
                <Form.Group controlId="formFileMultiple" className="my-5" >
                    <div className="contents title">
                        <Form.Label>종류를 알고 싶은 꽃 이미지를 업로드 해주세요.</Form.Label>
                    </div>
                    <Form.Control type="file" onChange={(e) => { encodeFileToBase64(e);}}  multiple />
                    <Button variant="outline-danger" className="btn_type1" onClick={handleSubmit} >Start Analysis</Button>{' '}
                </Form.Group>
            </Form>
            <div id="analysisResult">

            </div>
            <div className="preview">
                {imageSrc && <img src={imageSrc} alt="preview-img" />}
            </div>

            </div>                
        </React.Fragment>
    )

}

export default ProdList;