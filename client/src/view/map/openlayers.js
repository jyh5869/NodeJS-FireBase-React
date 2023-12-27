import React, { useEffect, useState } from "react";

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

    const handleClick = async (zoomType) => {

        if(zoomType == 'zoomIn'){
          setZoomLevel(zoomLevel+1);
        }
        else if(zoomType == 'zoomOut'){
          setZoomLevel(zoomLevel-1);
        }
    };

    //이벤트 리스너
    useEffect(() => {       
    },  []);
    
    
    //JSX 식으로 리스트 파싱
    return (
        <React.Fragment>
            <h1>오픈 레이어스</h1>
            <div className="my-3">
                <Map zoomLevel={zoomLevel}/>
            </div>  

            <Row>
                <Col className="d-grid gap-2"><Button variant="outline-success" id="zoom-out" onClick={(e) => { handleClick('zoomOut');}}>Zoom out</Button></Col>
                <Col className="d-grid gap-2"><Button variant="outline-success" id="zoom-in" onClick={(e) => { handleClick('zoomIn');}}>Zoom in</Button></Col>
            </Row> 
        </React.Fragment>
    )
}

export default Openlayers;