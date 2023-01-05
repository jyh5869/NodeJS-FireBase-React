import React, { useEffect, useState } from "react";
import { Button, Table, Form  }   from 'react-bootstrap';

import axios                          from 'axios';

import Loader from '../common/loader';
import Slider from '../common/slider';

import '../../assets/css/flower.css';


/**
 * @author 동물 종류 분석 및 분석 정보 표출 컴포넌트
 * @returns 동물 종류 분석 HTML
**/
const formData = new FormData();//이미지 데이터 저장 Form
function FlowerAnalysis() {

    const [list , setList] = useState([]);//해당꽃에대한 검색결과 리스트
    const [obj  , setObj ] = useState();//업로드 이미지 분석 결과 객체
    const [loading, setLoading]   = useState(false);//로딩 스피너
    const [imageSrc, setImageSrc] = useState('');//아마자 태그 변경시 실시간 미리보기
    const [flwInfo , setFlwInfo]  = useState([]);//해당꽃에대한 검색결과 리스트
    const [flwGrwInfo , setFlwGrwInfo] = useState([]);//해당꽃에대한 검색결과 리스트
    const color = [];

    //슬라이더 정보 배열 
    const sliderImgArr = ['/images/slider_cat.jpg', '/images/slider_dog.jpg']
    const sliderTitArr = ['고양이', '강아지']
    const sliderSubArr = ['도도하지만 츤데래 같은 매력 고양이', '귀엽고 친화적인 매력 강아지']

    /* 등록 이미지 미리보기 기능 */
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

    /* 업로드된 이미지를 분석 */
    const getFlowerAnalyResult = async () => {
        
        if(formData.get('file') == null){ 
            alert('등록된 이미지가 없습니다\n분석할 이미지를 참부 주세요.');
            return false;
        }
        
        let response = await axios({
            method : 'post',
            url    : '/api/flowerAnalysis',
            data   : formData,
            headers: {
                'Content-Type' : 'multipart/form-data'
            },
        })

        let analysisRes = response.data.results.korNm
        
        getFlowerInfoResult(analysisRes);//분류된 카테코리 정보 크롤링1
        getFlowerGrwResult(analysisRes);//분류된 카테코리 정보 크롤링2

        setObj(analysisRes);
    }

    /* 분석결과에 따른 크롤링 (정보1 - 백과사전) */
    const getFlowerInfoResult = async (analysisRes) => {

        let response = await axios({
            method  : 'get',
            url     : '/api/crawlingGoogle',
            params  : {
                'keyword' : analysisRes
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            },
        })
        
        var datas =  JSON.parse(response.data.results)
        var array = Object.values(datas)

        setFlwInfo(array)
    }

    /* 분석결과에 따른 크롤링 (정보2 - 사육정보) */
    const getFlowerGrwResult = async (analysisRes) => {

        let response = await axios({
            method  : 'get',
            url     : '/api/crawlingGoogleGrwFlw',
            params  : {
                'keyword' : analysisRes
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            },
        })

        var datas =  response.data.results
        
        setFlwGrwInfo(datas)
    }
    
    /* 모델 존재 여부 파악 */
    const getModelExistYn = async (modelNm) => {

        let response = await axios({
            method  : 'get',
            url     : '/api/getModelExistYn',
            params  : {
                'modelNm' : modelNm
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            },
        })

        var datas = response.data.results

        return datas;
    }
    
    /* 이미지 분석을 위한 데이터 전송 */
    function handleSubmit(e) {
        
        let modelNm = 'model_animal';
        let modelExistYn = getModelExistYn(modelNm);//모델 존재 여부 파악

        modelExistYn.then((value) => {
            if(value == true){
                getFlowerAnalyResult();//업로드된 이미지를 분류
            }
            else {
                alert(modelNm+ " 모델이 없습니다.\n모델 생성후 다시시도 해주세요.");
            }
        });
        
        e.preventDefault();
    }
    

    //이벤트 리스너
    useEffect(() => {

        //Axios 인터셉터 - 통신중 스피너 작동
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
            <h1>동물 종류 분석</h1>    
            <div className="my-3">
                <div>    
                    <Slider sliderImgArr={sliderImgArr} sliderTitArr={sliderTitArr} sliderSubArr={sliderSubArr}/>
                </div>    
                <div className="contents mt-4" id="flowerAnalysis">
                    <Form >
                        <Form.Group controlId="formFileMultiple" className="my-5" >
                            <div className="title">
                                <Form.Label><h4>종류를 알고싶은 동물 이미지를 업로드해 주세요.</h4></Form.Label>
                            </div>
                            <div className="content_2">
                                <span>
                                    <Form.Control  type="file" className="wrap_imgInput" onChange={(e) => { encodeFileToBase64(e);}}  multiple />
                                </span>
                                <span>
                                    <Button variant="outline-danger" className="btn_type1" onClick={handleSubmit} >분석하기</Button>{' '}
                                </span>
                            </div>
                        </Form.Group>
                    </Form>
                    <div className="preview">
                        {imageSrc && <img src={imageSrc} alt="preview-img" />}
                    </div>
                    <div id="analysisResult" className="content_1" style={{display:obj != null ?'block':'none'}}>
                        이 꽃은 <span className="innerText">{"'" + obj + "'"}</span> 입니다.
                    </div>
                </div>    

                {/* 스피너 */}
                <Loader loading={loading} color={color} type={"normal"} text={"분석중"} size={150} onClick={setLoading}/>

                {/* 분석된 대상 정보 표출 */}
                <Table bordered className="form2">
                    <tbody>
                        {flwInfo.map((list, index) => (
                            index != flwInfo.length -1
                            ? (
                                <tr key={index}>
                                    <td colSpan={2} className='text-center'>
                                        {list}
                                    </td>
                                </tr>
                            )
                            : ( 
                                <>
                                    {Object.values(JSON.parse(list)).map((list2, index) => (
                                        <tr key={index+'@'}>
                                            <th className='text-center' >{Object.keys(JSON.parse(list))[index]}</th>
                                            <td>
                                                <a>{list2}</a> 
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            )
                        ))}
                    </tbody>
                </Table>    
                <Table hover className="form2">
                    <tbody>
                        {flwGrwInfo.map((list, index) => (
                            <tr key={index} >
                                <td className="py-4 px-2">
                                    <h5><a href={list.url} target='_blank'>{list.title}</a></h5>
                                    <div>{list.contents}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>  
        </React.Fragment>
    )
}
export default FlowerAnalysis;