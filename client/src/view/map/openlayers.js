import React, { useEffect, useState } from "react";

import { Button, Table, Form  } from 'react-bootstrap';
import axios from 'axios';

//import Map1 from '../common/map copy';
import Map1 from '../common/map';

import '../../assets/css/flower.css';
import '../../assets/css/common.css';

/**
 * @author 꽃 종류 분석 및 분석 정보 표출 컴포넌트
 * @returns 꽃 종류 분석 HTML
**/
const formData = new FormData();//이미지 데이터 저장 Form
function Openlayers() {

    const [list , setList] = useState([]);//해당꽃에대한 검색결과 리스트
    const [obj  , setObj ] = useState();//업로드 이미지 분석 결과 객체
    const [loading, setLoading]   = useState(false);//로딩 스피너
    const [imageSrc, setImageSrc] = useState('');//아마자 태그 변경시 실시간 미리보기
    const [flwInfo , setFlwInfo]  = useState([]);//해당꽃에대한 검색결과 리스트
    const [flwGrwInfo , setFlwGrwInfo] = useState([]);//해당꽃에대한 검색결과 리스트
    const color = [];
    
    
    /*
      const map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });
    */
    //이벤트 리스너G
    useEffect(() => {       
    },  []);
    
    
    //JSX 식으로 리스트 파싱
    return (
        <React.Fragment>
            <h1>오픈 레이어스</h1>
            <div className="my-3">
                <Map1/>
                {/* <div id="map"></div> */}
                {/* <script type="module" src="../common/map.js"></script> */}
            </div>  
        </React.Fragment>
    )
}

export default Openlayers;