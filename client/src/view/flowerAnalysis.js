import React, { useEffect, useState } from "react";
import { Card, Button,Table,Form  }   from 'react-bootstrap';
import axios                          from 'axios';

import Loader from '../view/common/loader';

import '../assets/css/flowerAnalysis.css';


const formData = new FormData();//이미지 데이터 저장 Form

function FlowerAnalysis() {

    const [list , setList] = useState([]);//해당꽃에대한 검색결과 리스트
    const [obj  , setObj ] = useState([]);//업로드 이미지 분석 결과 객체
    const [loading, setLoading] = useState(false);//로딩 스피너
    const [imageSrc, setImageSrc] = useState('');//아마자 태그 변경시 실시간 미리보기
    const color = [];

    //이미지가 등록 될시 미리보기 기능 제공
    const encodeFileToBase64 = (e) => {
        formData.delete('file');

        const reader = new FileReader();
        
        const fileBlob = e.target.files[0]
        const uploadFile = fileBlob

        formData.append('file', uploadFile)

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

        let response = await axios({
            method: 'post',
            url: '/api/flowerAnalysis',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            
        })
        //console.log(response);
        setObj("이 꽃은 '"+response.data.results+ "' 입니다.");
    }

    const getFlowerInfoResult = async () => {

        let response = await axios({
            method: 'get',
            url: '/api/crawlingGoogle',
            data: {'keyword' : 'rose'},
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        })
        console.log(response);
    }

    //이미지 분석을 위한 데이터 전송
    function handleSubmit(e) {
        
        getFlowerAnalyResult();//업로드된 이미지를 분류
        getFlowerInfoResult(); //분류된 카테코리 정보 크롤링

        e.preventDefault();
    }
    

    //페이지 로드 후 및 이벤트 (JQUERY 선언과 비슷하다)
    useEffect(() => {

        //Axios 인터셉터
        axios.interceptors.request.use((config) => {
            console.log('loading layer open');
            setLoading(true);
            return config;
        }, (error) => {
            console.log('loading layer close caused by request error');
            setLoading(false);
            return Promise.reject(error);
        });

        axios.interceptors.response.use((config) => {
            console.log('loading layer close');
            setLoading(false);
            return config;
        }, (error) => {
            console.log('loading layer close caused by response error');
            setLoading(false);
            return Promise.reject(error);
        });

        return () => {

        }
        
    },  []);

    
    //JSX 식으로 리스트 파싱
    return (
        <React.Fragment>
            {/* <h1>Our new Products</h1> */}        
            <div className="contents my-5 mx-1" id="flowerAnalysis">
            <Form >
                <Form.Group controlId="formFileMultiple" className="my-5" >
                    <div className="title">
                        <Form.Label>종류를 알고 싶은 꽃 이미지를 업로드 해주세요.</Form.Label>
                    </div>
                    <div className="content_2">
                        <span>
                            <Form.Control  type="file" className="wrap_imgInput" onChange={(e) => { encodeFileToBase64(e);}}  multiple />
                        </span>
                        <span>
                            <Button variant="outline-danger" className="btn_type1" onClick={handleSubmit} >Start Analysis</Button>{' '}
                        </span>
                    </div>
                </Form.Group>
            </Form>
            <div className="preview">
                {imageSrc && <img src={imageSrc} alt="preview-img" />}
            </div>
            <div id="analysisResult" className="content_1">
                {obj}
            </div>
            </div>           
            <Loader loading={loading} color={color} onClick={setLoading}/>     
        </React.Fragment>
    )
}
export default FlowerAnalysis;