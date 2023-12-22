import React,  { useEffect, useState } from 'react';

import { Button, Table, Form, Badge, Stack, Container, Row, Col }   from 'react-bootstrap';

import axios from 'axios';
/*
교육 URL
https://openlayers.org/en/latest/examples/center.html
https://dev.to/camptocamp-geo/integrating-an-openlayers-map-in-vue-js-a-step-by-step-guide-2n1p
*/
import '../../assets/css/map.css';
import 'ol/ol.css';
import {Map} from 'ol';
import GeoJSON from 'ol/format/GeoJSON.js';
//import OSM from 'ol/source/OSM.js';
//import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import XYZ from 'ol/source/XYZ';

import {Draw, Modify, Snap} from 'ol/interaction.js';
import {GeometryCollection, Point, Polygon, Circle, LineString} from 'ol/geom.js';
import {circular} from 'ol/geom/Polygon.js';
import {getDistance} from 'ol/sphere.js';
import {transform} from 'ol/proj.js';
import {getCenter} from 'ol/extent';
import {Circle as CircleStyle, Stroke, Style, Fill} from 'ol/style.js';

import Feature from 'ol/Feature.js';
import {easeOut} from 'ol/easing.js';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import {getVectorContext} from 'ol/render.js';
import {unByKey} from 'ol/Observable.js';
import Overlay from 'ol/Overlay.js';

import Select from 'ol/interaction/Select.js';
import {altKeyOnly, click, pointerMove} from 'ol/events/condition.js';



import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {toStringHDMS} from 'ol/coordinate.js';

import GeojsonTest from '../../openLayers/examples/data/geojson/switzerland.geojson';

import {Popover} from 'bootstrap';

const tileLayer = new TileLayer({
    source: new XYZ({ //source: new OSM()
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    })
});

//url: '/client/src/data/movie/geogson/switzerland.geojson',
const source = new VectorSource({
    url: GeojsonTest,
    format: new GeoJSON(),
});

const vectorLayer = new VectorLayer({
    source: source,
    style: {
        'fill-color': 'rgba(255, 255, 255, 0.6)',
        'stroke-width': 1,
        'stroke-color': '#319FD3',
        'circle-radius': 5,
        'circle-fill-color': 'rgba(255, 255, 255, 0.6)',
        'circle-stroke-width': 1,
        'circle-stroke-color': '#319FD3',
    },
});

const Map1 = () => {

    const [show, setShow] = useState(false);
    const [drawFlag, setDrawFalg] = useState(false);//1. true: 피쳐 추가 혹은 수정
    const [featureInfo, setFeatureInfo] = useState(" 0 selected features ");
    
    const [circleCnt      , setCircleCnt    ] = useState(0);
    const [polygonCnt     , setPolygonCnt   ] = useState(0);
    const [pointCnt       , setPointCnt     ] = useState(0);
    const [lineStringCnt  , setLineStringCnt] = useState(0);
    const [geodesicCnt    , setGeodesicCnt  ] = useState(0);
    const [totalCnt       , setTotalCnt     ] = useState(0);

    const handleClose = () => setShow(false);

    const map = new Map({
        target: 'map',
        layers: [
            tileLayer,
            vectorLayer,
        ],
        view: new View({
            center: [ 126.97659953, 37.579220423 ], //포인트의 좌표를 리턴함
            projection : 'EPSG:4326',//경위도 좌표계 WGS84
            zoom: 6,
        })
    });

    let isDraw = false;
    const view = map.getView();
    const zoom = view.getZoom();

    map.on('click', function(evt) {
        //var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');

        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature;
        }); 

        //피쳐 없을때만 중심값 출력 
        if (!feature) {
            let coordinate = evt.coordinate;
            console.log(coordinate);
        }
    });
    
    const handleClick = async (zoomType) => {
        let currentZoom = view.getZoom();

        if(zoomType == 'zoomIn'){
          view.setZoom(currentZoom + 1);
        }
        else if(zoomType == 'zoomOut'){
          view.setZoom(currentZoom - 1);
        }
    };

    const Switzerland = async () => {
        const feature = source.getFeatures()[0];
        const polygon = feature.getGeometry();

        view.fit(polygon, {padding: [170, 50, 30, 150]});
    };

    const ZoomToLausanne = async () => {
        const feature = source.getFeatures()[1];
        const point   = feature.getGeometry();

        view.fit(point, {padding:  [170, 50, 30, 150]});
        view.setZoom(13);

    };

    const CenterOnLausanne = async () => {
        const feature = source.getFeatures()[1];
        const point = feature.getGeometry();
        const size = map.getSize();

        view.centerOn(point.getCoordinates(), size, [570, 500]);
    };



    const defaultStyle = new Modify({source: source})
        .getOverlay()
        .getStyleFunction();

    const modify = new Modify({
        source: source,
        style: function (feature) {
            feature.get('features').forEach(function (modifyFeature) {

                const modifyGeometry = modifyFeature.get('modifyGeometry');

                if (modifyGeometry) {
                    const modifyPoint = feature.getGeometry().getCoordinates();
                    const geometries = modifyFeature.getGeometry().getGeometries();
                    const polygon = geometries[0].getCoordinates()[0];
                    const center = geometries[1].getCoordinates();
                    const projection = map.getView().getProjection();
                    let first, last, radius;

                    if (modifyPoint[0] === center[0] && modifyPoint[1] === center[1]) {
                        // center is being modified
                        // get unchanged radius from diameter between polygon vertices
                        first = transform(polygon[0], projection, 'EPSG:4326');
                        last = transform(
                            polygon[(polygon.length - 1) / 2],
                            projection,
                            'EPSG:4326'
                        );
                        radius = getDistance(first, last) / 2;
                    } else {
                        // radius is being modified
                        first = transform(center, projection, 'EPSG:4326');
                        last = transform(modifyPoint, projection, 'EPSG:4326');
                        radius = getDistance(first, last);
                    }

                    // update the polygon using new center or radius
                    const circle = circular(
                        transform(center, projection, 'EPSG:4326'),
                        radius,
                        128
                    );

                    circle.transform('EPSG:4326', projection);
                    geometries[0].setCoordinates(circle.getCoordinates());
                    // save changes to be applied at the end of the interaction
                    modifyGeometry.setGeometries(geometries);
                }
            });

            return defaultStyle(feature);
        },
    });
    
    //console.log(modify);
    modify.on('modifystart', function (event) {
        console.log("수정 시작");
        isDraw = true;
        event.features.forEach(function (feature) {
            const geometry = feature.getGeometry();
            if (geometry.getType() === 'GeometryCollection') {
                feature.set('modifyGeometry', geometry.clone(), true);
            }
        });
    });

    modify.on('modifyend', function (event) {
        console.log("수정 종료");
        isDraw = false;
        event.features.forEach(function (feature) {
            const modifyGeometry = feature.get('modifyGeometry');
            if (modifyGeometry) {
                feature.setGeometry(modifyGeometry);
                feature.unset('modifyGeometry', true);
            }
        });
    });

    //Map 객채에 수정 인터렉션(Interation) 추가
    map.addInteraction(modify);
    
    //Map 객채에 특정 인터렉션(Interation)을 제거
    function removeInteraction(interactionType){

        if(interactionType == "draw"){
            map.removeInteraction(draw);
            isDraw = false;
        }
        else if(interactionType == "snap"){
            map.removeInteraction(snap);
        }
    }

    //Map 객채에 특정 인터렉션(Interation)을 추가
    function addInteraction(interactionType){

        if(interactionType == "draw"){
            map.addInteraction(draw);
            isDraw = true;
        }
        else if(interactionType == "snap"){
            map.addInteraction(snap);
        }
    }

    //지도 초기화
    const initMap =  async (e) => {
        //console.log(e.target.value)
        map.removeInteraction(draw);
        map.removeInteraction(snap);

        addInteractions(e);
    };

    let draw, snap, drawType; // global so we can remove them later
    async function addInteractions(e) {
        
        let value = e.target.value;
        let geometryFunction;

        if (value === 'Geodesic') {//측지선 Circle Feature

            value = 'Circle';

            geometryFunction = function (coordinates, geometry, projection) {

                if (!geometry) {
                    geometry = new GeometryCollection([
                    new Polygon([]),
                    new Point(coordinates[0]),
                    ]);
                }

                const geometries = geometry.getGeometries();
                const center = transform(coordinates[0], projection, 'EPSG:4326');
                const last = transform(coordinates[1], projection, 'EPSG:4326');
                const radius = getDistance(center, last);
                const circle = circular(center, radius, 128);

                circle.transform('EPSG:4326', projection);
                geometries[0].setCoordinates(circle.getCoordinates());
                geometry.setGeometries(geometries);

                return geometry;
            };
        }

        draw = new Draw({
            source: source,
            type: value,
            geometryFunction: geometryFunction,
        });
        snap = new Snap({source: source});
        drawType = e.target.value;

        map.addInteraction(draw);
        map.addInteraction(snap);
        console.log("그려보쟝!");

        isDraw = true;
    }

    /* Feature Draw시 동학하며 마지막 포인트를 없애 이전으로 돌아간다. */
    const removeLastPoint = async () => {
        draw.removeLastPoint();
    };

    /* 랜덤 좌표 찍기 */
    function addRandomFeature() {

        const x = Math.random() * 360 - 180;
        const y = Math.random() * 170 - 85;
        const geom = new Point(fromLonLat([x, y]));
        const feature = new Feature(geom);
        
        source.addFeature(feature);
    }
    

    /* 생성한 피쳐를 맵에 추가 */
    const duration = 3000;
    function flash(feature) {
        console.log("피쳐 추가!");

        const start = Date.now();
        const flashGeom = feature.getGeometry().clone();
        const listenerKey = tileLayer.on('postrender', animate);
        
        function animate(event) {
            const frameState = event.frameState;
            const elapsed = frameState.time - start;
            
            if (elapsed >= duration) {
                unByKey(listenerKey);
                return;
            }

            const vectorContext = getVectorContext(event);
            const elapsedRatio = elapsed / duration;
            // radius will be 5 at start and 30 at end.
            const radius = easeOut(elapsedRatio) * 25 + 5;
            const opacity = easeOut(1 - elapsedRatio);
        
            const style = new Style({
                image: new CircleStyle({
                    radius: radius,
                    stroke: new Stroke({
                    color: 'rgba(255, 0, 0, ' + opacity + ')',
                    width: 0.25 + opacity,
                    }),
                }),
            });
        
            vectorContext.setStyle(style);
            vectorContext.drawGeometry(flashGeom);
            // tell OpenLayers to continue postrender animation
            map.render();
        }

        //Draw Interation 종료
        removeInteraction("draw");
    }
















    let select = null; // Select 인터렉션 변수 생성

    const selected = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new Stroke({
            color: '#f19ca3',
            width: 2,
        }),
    });

    function selectStyle(feature) {
        const color = feature.get('COLOR') || 'rgba(255, 255, 255, 0.6)';
        selected.getFill().setColor(color);
        return selected;
    }
      
    // select interaction working on "singleclick"
    const selectSingleClick = new Select({style: selectStyle});
      
    // select interaction working on "click"
    const selectClick = new Select({
        condition: click,
        style: selectStyle,
    });
      
    // select interaction working on "pointermove"
    const selectPointerMove = new Select({
        condition: pointerMove,
        style: selectStyle,
    });
      
    const selectAltClick = new Select({
        style: selectStyle,
        condition: function (mapBrowserEvent) {
            return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
        },
    });
    
    map.addInteraction(selectSingleClick);
    

    /*  
        Overlay PopUp 세팅
        1. Feature OverlayPop
        2. Map OverlayPop

        참고 URL : https://openlayers.org/en/latest/examples/overlay.html
    */
    const popup = new Overlay({
        element: document.getElementById('popup'),
    });
    const popupMap = new Overlay({
        element: document.getElementById('popupMap'),
    });

    map.addOverlay(popup);
    map.addOverlay(popupMap);
    
    const element = popup.getElement();
    const elementMap = popupMap.getElement();



    let popover = Popover.getInstance(element);//팝오버 객체 생성
    
    
    select = selectSingleClick;
    select.on('select', function (e) {
        console.log("셀렉트이벤트 발생!11" + e.target.getFeatures().getLength());
        selectFeatureInfoBox(e, "FEATURE");
        
        if(e.target.getFeatures().getLength() != 0){
            console.log("셀렉트이벤트 발생!222" + e.target.getFeatures().getLength());
            e.target.getFeatures().forEach(function(feature, idx){
               
                let geomType = feature.getProperties().type;
                let center;

                //피쳐 추가시 Type Propertiy 세팅
                if(geomType == 'Geodesic'){ 
                    console.log('Geodesic');
                    center = getCenter(feature.getGeometry().getExtent());
                }
                else if(geomType == 'Circle'){
                    console.log('Circle');
                    center = feature.getGeometry().getCenter();
                }
                else if(geomType == 'Polygon'){
                    console.log('Polygon');
                    center = getCenter(feature.getGeometry().getExtent());
                }
                else if(geomType == 'LineString'){
                    console.log('LineString');
                    center = getCenter(feature.getGeometry().getExtent());
                }
                else if(geomType == 'Point'){
                    console.log('Point');
                    center = feature.getGeometry().getCoordinates();
                }
                console.log("셀렉트이벤트 발생!333" +center);
                //popup.setPosition(coordinate);
                popup.setPosition(center);
                
                if (popover) {
                    popover.dispose();
                }
                
                popover = new Popover(element, {
                    animation: false,
                    container: element,
                    content: '<p>클릭한 위치의 피쳐 정보:</p><code>' + center + '</code>',
                    html: true,
                    placement: 'top',
                    title: 'Welcome to OpenLayers',
                });
    
                //팝오버 표출
                popover.show();
            });
        }      
    });


    const changeInteraction = function (clickType) {

        if (select !== null) {
            map.removeInteraction(select);
        }

        const value = clickType;

        if (value == 'singleclick') {
            select = selectSingleClick;
        } else if (value == 'click') {
            select = selectClick;
        } else if (value == 'pointermove') {
            select = selectPointerMove;
        } else if (value == 'altclick') {
            select = selectAltClick;
        } else {
            select = selectClick;
        }
        
        if (select !== null) {
            map.addInteraction(select);

            select.on('select', function (e) {

                selectFeatureInfoBox(e, "MAP");
                console.log("이벤트 발생 Value : " + value);
                
                if(e.target.getFeatures().getLength() != 0){
        
                    e.target.getFeatures().forEach(function(feature, idx){
        
                        let geomType = feature.getProperties().type;
                        let center;
        
                        //피쳐 추가시 Type Propertiy 세팅
                        if(geomType == 'Geodesic'){ 
                            console.log('Geodesic');
                            center = getCenter(feature.getGeometry().getExtent());
                        }
                        else if(geomType == 'Circle'){
                            console.log('Circle');
                            center = feature.getGeometry().getCenter();
                        }
                        else if(geomType == 'Polygon'){
                            console.log('Polygon');
                            center = getCenter(feature.getGeometry().getExtent());
                        }
                        else if(geomType == 'LineString'){
                            console.log('LineString');
                            center = getCenter(feature.getGeometry().getExtent());
                        }
                        else if(geomType == 'Point'){
                            console.log('Point');
                            center = feature.getGeometry().getCoordinates();
                        }
                        
                        popup.setPosition(center);
                        
                        if (popover) {
                            popover.dispose();
                        }
                        
                        popover = new Popover(element, {
                            animation: false,
                            container: element,
                            content: '<p>클릭한 위치의 피쳐 정보:</p><code>' + center + '</code>',
                            html: true,
                            placement: 'top',
                            title: 'Welcome to OpenLayers',
                        });
            
                        //팝오버 표출
                        popover.show();
                    });
                }      
            });
        }
    };

    
    /**
     * 지도 클릭시 피쳐가 없는 부분에 팝업 띄우기
     */
    map.on('click', function (evt) {
        
        if(isDraw == true){ return false}

        console.log("지도 클릭시 위치정보 Overlay : " + isDraw);
        let popoverMap = Popover.getInstance(elementMap);//팝오버 객체 생성
        let coordinate = evt.coordinate;
        let hdms = toStringHDMS(toLonLat(coordinate));
        let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {return feature;});//피쳐가 있을시 피쳐를 반환
        
        if (feature == undefined) {
            
            selectFeatureInfoBox(evt, "MAP");

            popupMap.setPosition(coordinate);
         
            if (popoverMap) {
                popoverMap.dispose();
            }
            
            popoverMap = new Popover(elementMap, {
                animation: false,
                container: elementMap,
                content: '<p>클릭한 부분의 위치정보</p><code>' + hdms + '</code>',
                html: true,
                placement: 'top',
                title: 'Welcome to OpenLayers',
            });

            //지도클릭 팝오버 표출 및 피쳐 팝오버 비활성화
            popoverMap.show();
            if(popover != null){
                popover.hide();
            }
        }
        else{
            //팝오버 존재시 숨기기
            if(popoverMap != null){
                popoverMap.hide();
            }
        }
    });


    /* Select 이벤트 발생시 해당 이벤트의 정보 */
    const selectFeatureInfoBox = async(event, selectType) => {

        if(selectType == "FEATURE"){
            document.getElementById('status').innerHTML =
            '&nbsp;' +
            event.target.getFeatures().getLength() +
            ' selected features (last operation selected ' +
            event.selected.length +
            ' and deselected ' +
            event.deselected.length +
            ' features)';
        }
        else{
            document.getElementById('status').innerHTML = "지도 클릭 선택된 피쳐가 없습니다."
        }
    };

    /* 지도 포인트 이동시 이벤트 */
    map.on('pointermove', function (e) {
        if (!e.dragging) {
            var pixel = map.getEventPixel(e.originalEvent);
            var hit = map.hasFeatureAtPixel(pixel);
        }
    });



















    //Circle객체를 저장하기위해 원 객체 반환
    const transeformCircleToSaveFeature = async(cloneFeature, type) => {

        // 1. POINT + RADIUS : 1.데이터가 크다,  2. 축소 확대시 별도의 처리 필요없음
        if(type == 'Circle'){

            let geometry = cloneFeature.getGeometry()
            let radius = geometry.getRadius();
            let center = geometry.getCenter();
    
            //const circle = circular(center, radius, 128);
            
            let feature = new Feature({
                type: 'Feature',
                geometry: new Circle(center, radius),
            });

            feature.setId(cloneFeature.getId());

            return feature;
        }
        // 2. POINT + POLYGONE : 1. 데이터 가 작으나, 2. 축소확대시 별도의 처리 필요
        else if(type =='Polygon'){

        }    
    }

    
    const saveFeature = async (feature) => {
        console.log("저장할 피쳐 보기");
        const featureArr = [];
        var geom = source.getFeatures();

        vectorLayer.getSource().forEachFeature(function(feature) {

            let cloneFeature = feature.clone();
            let featureId = feature.getId();
            let geomType = cloneFeature.getProperties().type;

            
            console.log(cloneFeature.getProperties());

            if(geomType == "Circle"){
                //Circle 객체를 Center와 Radius 프로퍼티를 가진 Point Feature로 변환
                let radius = cloneFeature.getGeometry().getRadius();
                let center = cloneFeature.getGeometry().getCenter();

                let feature = new Feature({
                    realType : cloneFeature.getProperties().realType,
                    type: geomType,
                    geometry: new Point(center),
                    radius: radius,
                });
                cloneFeature = feature;
            }

            cloneFeature.setId(featureId); // 저장할 Feature에 아이디값 세팅

            if(cloneFeature.getId() == undefined ){//신규 등록
                //console.log("ID : " + cloneFeature.getId()  + "/  인서트!" );

                cloneFeature.setProperties({"state" : "insert"});
            }
            else{//업데이트
                //console.log("ID : "+ cloneFeature.getId()  + "/  업데이트!" );
                cloneFeature.setProperties({"state" : "update"});
            }
            
            featureArr.push(cloneFeature);
        });

        var geoJsonOri = new GeoJSON().writeFeatures(geom);
        var geoJsonClone = new GeoJSON().writeFeatures(featureArr);

        let response = await axios({
            method  : 'get',
            url     : '/api/geomboardSave',
            params  : {
                'geom' : geoJsonClone
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            }, 
        })
        if(response.status == 200){
            console.log(response.status);
            console.log("저장완료!!");

            source.clear();
            callFeature();
        } 
    }

    /* 저장된 지오메트릭 데이터 불러오기 */
    const callFeature = async (feature) => {

        let response = await axios({
            method  : 'get',
            url     : '/api/geomboardList',
            params  : {
                id : "하위하위"
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            },
        })
            
        var datas =  response.data.rows;
        var array = Object.values(datas)
        console.log(datas);

        /* 피쳐보이기 부터 해보자 */
        const featureArr = [];
        //datas.forEach(async function(value, index){
        //for (const [idx, value] of datas.entries()) {
        const promises = datas.map(async (value, index) => {

            let feature = new GeoJSON().readFeature(value.geom_value);

            let geometry = new GeoJSON().readFeature(value.geom_value);
            let properties = JSON.parse(value.geom_prop);
            let geomType = properties.type;
            console.log( "11111111111  "+ index);
            // 원일 경우 Center와 Radius를 이용해 추가.
            if (geomType == 'Circle') {
                console.log('--- Set Circle ---');
                let radius = properties.radius;//반지름
                let center = geometry.getGeometry().getCoordinates();//중심점 좌표

                feature = new Feature({
                    type: 'Feature',
                    geometry: new Circle(center, radius),
                });                
            }
            console.log("22222222222222  " + index);
            feature.setId(value.id);//ID값 세팅
            feature.setProperties(properties);//프로퍼티 값 세팅

            featureArr.push(feature);
        
            console.log(properties);
            console.log("333333333333  " + index);
            // 지오메트릭 타입별로 카운팅 
            //cntOfFeatureType(geomType, index);
            console.log("444444444444  " + index);
        });

        await Promise.all(promises);

        source.addFeatures(featureArr);
    }

    /* 지오메트릭 타입별 갯수 표출 함수 */
    const cntOfFeatureType = async (featureType, idx) => {

        setTotalCnt(totalCnt => totalCnt + 1);

        if(featureType == 'Geodesic'){ 
            setGeodesicCnt(geodesicCnt => geodesicCnt + 1);
        }
        else if(featureType == 'Circle'){
            setCircleCnt(circleCnt => circleCnt + 1);
        }
        else if(featureType == 'Polygon'){
            setPolygonCnt(polygonCnt => polygonCnt + 1);
        }
        else if(featureType == 'LineString'){
            setLineStringCnt(lineStringCnt => lineStringCnt + 1);
        }
        else if(featureType == 'Point'){
            setPointCnt(pointCnt => pointCnt + 1);
        }
    }

    source.on('addfeature', function (e) {

        //피쳐 추가시 Type Propertiy 세팅
        if(drawType == 'Geodesic'){ 
            e.feature.set('realType', 'GeometryCollection');
            e.feature.set('type'    , 'Geodesic');
        }
        else if(drawType == 'Circle'){
            e.feature.setProperties({'realType':'Circle', 'type':'Circle'})
        }
        else if(drawType == 'Polygon'){
            e.feature.setProperties({'realType':'Polygon', 'type':'Polygon'})
        }
        else if(drawType == 'LineString'){
            e.feature.setProperties({'realType':'LineString', 'type':'LineString'})
        }
        else if(drawType == 'Point'){
            e.feature.setProperties({'realType':'Point', 'type':'Point'})
        }

        flash(e.feature);

    });

      
    source.on('selectfeature', function (e) {
        console.log("피쳐선택!");
        flash(e.feature);
    });

    //이벤트 리스너
    useEffect((easeOut) => {
        callFeature();
    },  []);

    //window.setInterval(addRandomFeature, 3000);
    return (
        <>  
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
                        <Badge bg="light" text="dark">추가 : </Badge>
                        <Badge bg="dark" text="light">변경 : </Badge>
                    </Stack>
                </Col>
            </Row>

            <Row className='mb-3'>
                <Col className="text-center" id="status" >{featureInfo}</Col>
            </Row>

            <div id="map"></div>

            <Row className='mb-3'>
                <Col>
                    <Button variant="outline-success" className="btn_type1" onClick={saveFeature}>저장하기</Button>   
                </Col>
            </Row>

            <Row className='mb-3'>
                <Col>
                    <div className="input-group">
                        <label className="input-group-text" htmlFor="type">Geometry type</label>
                        <Form.Select id="type" onChange={(e) => { initMap(e);}} value={drawType}>
                            <option key={1} value="Point" >Point</option>
                            <option key={2} value="LineString">LineString</option>
                            <option key={3} value="Polygon">Polygon</option>
                            <option key={4}value="Circle">Circle Geometry</option>
                            <option key={5} value="Geodesic">Geodesic Circle</option> 
                        </Form.Select>
                        <Button variant="outline-primary" onClick={(e) => { removeLastPoint();}}>이전으로</Button>
                    </div>
                </Col>
                <Col>
                    <div className="input-group">
                        <label className="input-group-text" htmlFor="type2">Action type &nbsp;</label>
                        <Form.Select id="type2" onChange={(e) => { changeInteraction(e.target.value);}} defaultValue={"none"}>
                            <option key={1} value="click">Click</option>
                            <option key={2} value="singleclick">Single-click</option>
                            <option key={3} value="pointermove">Hover</option>
                            <option key={4} value="altclick">Alt+Click</option>
                            <option key={5} value="none">None</option>
                        </Form.Select>
                    </div>
                </Col>
            </Row>

            <Row className='mb-3'>
                <Col className="d-grid gap-2"><Button variant="outline-danger" id="zoomtoswitzerland" onClick={(e) => { Switzerland();}}>Zoom to Switzerland</Button></Col>
                <Col className="d-grid gap-2"><Button variant="outline-danger" id="zoomtolausanne" onClick={(e) => { ZoomToLausanne();}}>Zoom to Lausanne</Button></Col>
                <Col className="d-grid gap-2"><Button variant="outline-danger" id="centerlausanne" onClick={(e) => { CenterOnLausanne();}}>Center on Lausanne</Button></Col>
            </Row>

            <Row>
                <Col className="d-grid gap-2"><Button variant="outline-success" id="zoom-out" onClick={(e) => { handleClick('zoomOut');}}>Zoom out</Button></Col>
                <Col className="d-grid gap-2"><Button variant="outline-success" id="zoom-in" onClick={(e) => { handleClick('zoomIn');}}>Zoom in</Button></Col>
            </Row>


            <div id="popup"></div>
            <div id="popupMap"></div>
            <div id="selectPopup"></div>
        </>
    );
}
  
export default Map1;

