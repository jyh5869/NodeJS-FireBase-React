import React, { useEffect, useState, useRef, useCallback } from "react";

import { Button, Table, Form, Badge, Stack, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

//import Map1 from '../common/map copy';
import Map from '../common/map';

import GeoJSON from 'ol/format/GeoJSON.js';
import Feature from 'ol/Feature.js';
import { GeometryCollection, Point, Polygon, Circle, LineString } from 'ol/geom.js';

import '../../assets/css/flower.css';
import '../../assets/css/common.css';
import { NodeJSKernelBackend } from "@tensorflow/tfjs-node/dist/nodejs_kernel_backend";

/**
 * @author 오픈레이어스를 이용한 공간데이터 게시판
 * @returns 공간데이터 게시판
**/

function Openlayers() {

    const [loaded, setLoaded] = useState(false);

    const [zoomType, setZoomType] = useState();
    const [actionType, setActionType] = useState('null');
    const [arrSource, setArrSource] = useState(() => { return [] });

    const [circleCnt, setCircleCnt] = useState(0);
    const [polygonCnt, setPolygonCnt] = useState(0);
    const [pointCnt, setPointCnt] = useState(0);
    const [lineStringCnt, setLineStringCnt] = useState(0);
    const [geodesicCnt, setGeodesicCnt] = useState(0);
    const [totalCnt, setTotalCnt] = useState(0);
    const [insertFeatureCnt, setInsertFeatureCnt] = useState(0);
    const [updateActionCnt, setUpdateActionCnt] = useState(0);
    const [updateFeatureCnt, setUpdateFeatureCnt] = useState(0);
    const [deleteFeatureCnt, setDeleteFeatureCnt] = useState(0);

    const childComponentRef = useRef({ "type": "1" });

    const getSource = async source => {
        saveFeature(source);
    };

    const handleClick = async (e, zoomType) => {

        if (zoomType === 'zoomIn') {
            setZoomType('zoomIn');
        } else if (zoomType === 'zoomOut') {
            setZoomType('zoomOut');
        }
    };

    useEffect(() => {
        if (zoomType) {
            childComponentRef.current.willBeUsedInParentComponent();
        }
    }, [zoomType]);

    const mapControlHandler = async (actionType) => {

        if (actionType == 'clearSource') {
            await setActionType('clearSource');
            childComponentRef.current.willBeUsedInParentComponent();
        }

        if (actionType == 'getSource') {
            await setActionType('getSource');
            childComponentRef.current.willBeUsedInParentComponent();
        }

        if (actionType == 'null') {
            await setActionType('null');
            childComponentRef.current.willBeUsedInParentComponent();
        }
    };

    const cntOfFeatureType = async (featureType, idx) => {
        //console.log(props);
        setTotalCnt(totalCnt => totalCnt + 1);

        if (featureType == 'Geodesic') {
            setGeodesicCnt(geodesicCnt => geodesicCnt + 1);
        }
        else if (featureType == 'Circle') {
            setCircleCnt(circleCnt => circleCnt + 1);
        }
        else if (featureType == 'Polygon') {
            setPolygonCnt(polygonCnt => polygonCnt + 1);
        }
        else if (featureType == 'LineString') {
            setLineStringCnt(lineStringCnt => lineStringCnt + 1);
        }
        else if (featureType == 'Point') {
            setPointCnt(pointCnt => pointCnt + 1);
        }
    }

    /* 저장된 지오메트릭 데이터 불러오기 */
    const callFeature = async (feature) => {
        console.log("FIREBASE 클라우드 DB에 저장된 피쳐를 불러올게요.");

        let response = await axios({
            method: 'get',
            url: '/api/geomboardList',
            params: {
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        })

        var datas = response.data.rows;

        /* 피쳐보이기 부터 해보자 */
        const featureArr = [];

        const promises = datas.map(async (value, index) => {

            let feature = new GeoJSON().readFeature(value.geom_value);
            let geometry = new GeoJSON().readFeature(value.geom_value);
            let properties = JSON.parse(value.geom_prop);
            let geomType = properties.type;

            //원일 경우 Center와 Radius를 이용해 추가.
            if (geomType == 'Circle') {

                let radius = properties.radius;//반지름
                let center = geometry.getGeometry().getCoordinates();//중심점 좌표

                feature = new Feature({
                    type: 'Feature',
                    geometry: new Circle(center, radius),
                });
            }

            feature.setId(value.id);//ID값 세팅
            feature.setProperties(properties);//프로퍼티 값 세팅

            featureArr.push(feature);

            //지오메트릭 타입별로 카운팅 
            cntOfFeatureType(geomType, index);
        });

        await Promise.all(promises);
        await setArrSource(featureArr);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const saveFeature = async (vectorLayer) => {
        console.log("데이터를 저장 합니다.");
        const featureArr = [];

        vectorLayer.getSource().forEachFeature(function (feature) {

            let cloneFeature = feature.clone();
            let featureId = feature.getId();
            let geomType = cloneFeature.getProperties().type;

            if (geomType == "Circle") {
                //Circle 객체를 Center와 Radius 프로퍼티를 가진 Point Feature로 변환
                let radius = cloneFeature.getGeometry().getRadius();
                let center = cloneFeature.getGeometry().getCenter();

                let feature = new Feature({
                    realType: cloneFeature.getProperties().realType,
                    type: geomType,
                    geometry: new Point(center),
                    radius: radius,
                });
                cloneFeature = feature;
            }

            cloneFeature.setId(featureId);//저장할 Feature에 아이디값 세팅

            if (cloneFeature.getId() == undefined) {//신규 등록
                //console.log("ID : " + cloneFeature.getId()  + "/  INSERT" );
                cloneFeature.setProperties({ "state": "insert" });
            }
            else if (cloneFeature.getProperties().state == "delete") {//신규 등록
                //console.log("ID : " + cloneFeature.getId()  + "/  DELETE!" );
                cloneFeature.setProperties({ "state": "delete" });
            }
            else {//업데이트
                //console.log("ID : "+ cloneFeature.getId()  + "/  UPDATE" );
                cloneFeature.setProperties({ "state": "update" });
            }

            featureArr.push(cloneFeature);
        });

        var geoJsonClone = new GeoJSON().writeFeatures(featureArr);

        let response = await axios({
            method: 'get',
            url: '/api/geomboardSave',
            params: {
                'geom': geoJsonClone
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        })

        if (response.status == 200) {

            console.log("저장완료 Code : " + response.status);

            await setLoaded(true);
            await callFeature();
            await setInitStatus();

        }
    }

    /* 공간 데이터 변경 현황핀 초기화 */
    const setInitStatus = async (status) => {

        setInsertFeatureCnt(0);
        setUpdateActionCnt(0);
        setUpdateFeatureCnt(0);
        setDeleteFeatureCnt(0);
    }

    /* 공간 데이터 변경 현황핀 업데이트 (1. 추가, 2. 변경 엑션, 3. 변경된 피쳐) */
    const setRegAndModifyStatus = async (status) => {

        if (status == "InsertFeature") {
            setInsertFeatureCnt(insertFeatureCnt => insertFeatureCnt + 1);
        }
        else if (status == "UpdateAction") {
            setUpdateActionCnt(updateActionCnt => updateActionCnt + 1);
        }
        else if (status == "UpdateFeature") {
            setUpdateActionCnt(updateActionCnt => updateActionCnt + 1);
            setUpdateFeatureCnt(updateFeatureCnt => updateFeatureCnt + 1);
        }
        else if (status == "DeleteFeature") {
            setDeleteFeatureCnt(deleteFeatureCnt => deleteFeatureCnt + 1);
        }
        else if (status == "initFeature") {
            setInitStatus();
        }
    }

    //이벤트 리스너 페이지 로드
    useEffect(() => {
        callFeature();
    }, []);

    return (
        <React.Fragment>
            <h1>오픈 레이어스</h1>
            <Row className='mb-3'>
                <Col>
                    <Stack direction="horizontal" gap={2}>
                        <Badge bg="info">Total: {totalCnt}</Badge>
                        <Badge bg="primary">polygone: {polygonCnt}</Badge>
                        <Badge bg="secondary">LineString: {lineStringCnt}</Badge>
                        <Badge bg="success">Point: {pointCnt}</Badge>
                        <Badge bg="danger">Circle: {circleCnt}</Badge>
                        <Badge bg="warning">Geodesic: {geodesicCnt}</Badge>
                    </Stack>
                </Col>
                <Col>
                    <Stack className="float-end" direction="horizontal" gap={2}>
                        <Badge bg="light" text="dark">추가 : {insertFeatureCnt}</Badge>
                        <Badge bg="light" text="dark">삭제 : {deleteFeatureCnt}</Badge>
                        <Badge bg="dark" text="light">변경(Action) : {updateActionCnt}</Badge>
                        <Badge bg="dark" text="light">변경(Feature) : {updateFeatureCnt}</Badge>
                    </Stack>
                </Col>
            </Row>

            <Row className="my-3">
                <Map zoomType={zoomType} arrSource={arrSource} actionType={actionType} ref={childComponentRef} getSource={getSource} setRegAndModifyStatus={setRegAndModifyStatus} />
            </Row>

            <Row>
                <Col className="d-grid gap-2"><Button variant="outline-success" id="zoom-out" onClick={(e) => { handleClick(e, 'zoomOut'); }}>Zoom out</Button></Col>
                <Col className="d-grid gap-2"><Button variant="outline-success" id="zoom-in" onClick={(e) => { handleClick(e, 'zoomIn'); }}>Zoom in</Button></Col>
            </Row>
        </React.Fragment>
    )
}

export default Openlayers;