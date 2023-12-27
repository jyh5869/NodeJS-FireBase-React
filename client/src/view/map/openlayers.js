import React, { useEffect, useState, useRef } from "react";

import { Button, Table, Form, Badge, Stack, Container, Row, Col }   from 'react-bootstrap';
import axios from 'axios';

//import Map1 from '../common/map copy';
import Map from '../common/map';

import '../../assets/css/flower.css';
import '../../assets/css/common.css';

/**
 * @author 꽃 종류 분석 및 분석 정보 표출 컴포넌트
 * @returns 꽃 종류 분석 HTML
**/
const formData = new FormData();//이미지 데이터 저장 Form

function Openlayers() {

    const [zoomLevel , setZoomLevel] = useState(6);

    const childComponentRef = useRef({"type":"1"});

    //이거공부하자 ------------------------> https://velog.io/@ahsy92/React-%EB%B6%80%EB%AA%A8%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EC%97%90%EC%84%9C-%EC%9E%90%EC%8B%9D%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%ED%95%A8%EC%88%98-%ED%98%B8%EC%B6%9C%ED%95%98%EA%B8%B0
    
    const handleClick2 = async (e,zoomType) => {
        childComponentRef.current.willBeUsedInParentComponent();  
        if(zoomType == 'zoomIn'){
            setZoomLevel(zoomLevel+1);
        }
        else if(zoomType == 'zoomOut'){
            setZoomLevel(zoomLevel-1);
        }
    };

    //이벤트 리스너
    useEffect(() => {
        //childComponentRef.current.willBeUsedInParentComponent();       
    }, []);
    
    
    //JSX 식으로 리스트 파싱
    return (
        <React.Fragment>
            <h1>오픈 레이어스</h1>
            <div className="my-3">
                <Map zoomLevel={zoomLevel} ref={childComponentRef}/>
            </div>  

            <Row>
                <Col className="d-grid gap-2"><Button variant="outline-success" id="zoom-out" onClick={(e) => { handleClick2(e,'zoomOut');}}>Zoom out</Button></Col>
                <Col className="d-grid gap-2"><Button variant="outline-success" id="zoom-in" onClick={(e) => { handleClick2(e,'zoomIn');}}>Zoom in</Button></Col>
            </Row> 
        </React.Fragment>
    )
}

export default Openlayers;