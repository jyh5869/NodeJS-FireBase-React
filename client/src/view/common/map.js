import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { Button, Table, Form, Badge, Stack, Container, Row, Col, Popover as ReactBootstrapPopover } from 'react-bootstrap';

import axios from 'axios';

import '../../assets/css/map.css';
import 'ol/ol.css';
import { Map as OlMap } from 'ol';
import GeoJSON from 'ol/format/GeoJSON.js';
import View from 'ol/View.js';
import XYZ from 'ol/source/XYZ';

import { Draw, Modify, Snap } from 'ol/interaction.js';
import { GeometryCollection, Point, Polygon, Circle, LineString } from 'ol/geom.js';
import { circular } from 'ol/geom/Polygon.js';
import { getDistance } from 'ol/sphere.js';
import { transform } from 'ol/proj.js';
import { getCenter } from 'ol/extent';
import { Circle as CircleStyle, Stroke, Style, Fill } from 'ol/style.js';

import Feature from 'ol/Feature.js';
import { easeOut } from 'ol/easing.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import { getVectorContext } from 'ol/render.js';
import { unByKey } from 'ol/Observable.js';
import Overlay from 'ol/Overlay.js';

import Select from 'ol/interaction/Select.js';
import { altKeyOnly, click, pointerMove, singleClick } from 'ol/events/condition.js';

import { get as getProjection } from 'ol/proj.js'; //위경도


import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { toStringHDMS } from 'ol/coordinate.js';
import { Popover } from 'bootstrap';

import GeojsonTest from '../../openLayers/examples/data/geojson/switzerland.geojson';


/* START - 오픈레이어스 Map 객체 생성 (TILE, SOURCE, LAYER) */
const tileLayerXYZ = new TileLayer({
    source: new XYZ({ //source: new OSM()
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    })
});

const tileLayerOSM = new TileLayer({
    source: new OSM()
});

const source = new VectorSource({
    //url: GeojsonTest,
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
/* END - 오픈레이어스 Map 객체 생성 (TILE, SOURCE, LAYER) */


/* START - 셀렉트 객체및 이벤트 생성 */
//Select 객체 생성
const selected = new Style({
    fill: new Fill({
        color: 'rgba(255, 255, 255, 0.6)'
    }),
    stroke: new Stroke({
        color: '#f19ca3',
        width: 2,
    }),
});

//Select 스타일
function selectStyle(feature) {
    const color = feature.get('COLOR') || 'rgba(255, 255, 255, 0.6)';
    selected.getFill().setColor(color);
    return selected;
}

//Single Click 이벤트
const selectSingleClick = new Select({
    style: selectStyle
});

//Click 이벤트
const selectClick = new Select({
    condition: click,
    style: selectStyle,
});

//Hover 이벤트
const selectPointerMove = new Select({
    condition: pointerMove,
    style: selectStyle,
});

//Alt + Click 이벤트
const selectAltClick = new Select({
    style: selectStyle,
    condition: function (mapBrowserEvent) {
        return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
    },
});
/* END - 셀렉트 객체및 이벤트 생성 */

export const Map = forwardRef((props, forwardedRef) => {

    useImperativeHandle(forwardedRef, () => ({
        //부모에서 사용하고 싶었던 함수
        willBeUsedInParentComponent,
    }));

    function willBeUsedInParentComponent() {
        handleClick(props.zoomType);
    }

    const [loaded, setLoaded] = useState();
    const [bboxLayer, setBboxLayer] = useState(null);//BBOX 레이어
    const [parnetActionType, setParnetActionType] = useState(props.actionType);
    const [mapObj, setMap] = useState();
    const [isDraw, setIsDraw] = useState(false);
    const [view, setView] = useState();
    const [zoom, setZoom] = useState();
    const [featureInfo, setFeatureInfo] = useState(" 선택된 공간데이터가 없습니다. ");
    const [popoverFeature, setPopoverFeature] = useState();
    const [popoverMap, setPopoverMap] = useState();
    const [statusArr, setStatusArr] = useState([]);//신규, 변경 현황을 표출하기위한 배열

    const sendSourceToParents = () => {
        props.getSource(vectorLayer).then(function () {
            source.clear();
        });
    }

    source.addFeatures(props.arrSource);
    console.log("지도컴포넌트 호출!");

    /* START 자식 컴포넌트에서 부모 컴포넌트로 데이터 전달 START  */
    /* 피쳐의 추가나 변경이 발생시 부모 컴포넌트의 상황판에 정보 전달 */
    const sendRegAndModifyStatus = (status, feature) => {

        console.log(parnetActionType + ' == parnetActionType : ' + feature.ol_uid+ ' 부모 컴포넌트의 상황판 : ' + status + "   geomType : " + geomType);
        let geomType = feature.getProperties().type;//지오메트릭 타입

        //소스를 최초 가져왔을때, 소스를 클리어할때 상황판 초기화
        if (props.actionType == 'getSource' || props.actionType == 'clearSource') {
            props.setRegAndModifyStatus("initFeature").then(function () { });
        }
        else {
            if (status == "Insert" && statusArr.includes(feature.ol_uid) == false) {//추가된 공간데이터 현황 업데이트
                props.setRegAndModifyStatus("InsertFeature", geomType).then(function () { });
            }
            else if (status == "Update") {//변경된 공간데이터 현황 업데이트
                if (statusArr.includes(feature.ol_uid)) {//1.피쳐 변경 횟수 업데이트
                    props.setRegAndModifyStatus("UpdateAction", geomType).then(function () { });
                } else {//2.피쳐 변경 횟수 + 변경된 피쳐 갯수 업데이트
                    props.setRegAndModifyStatus("UpdateFeature", geomType).then(function () { });
                }
            }
            else if (status == "Delete") {//삭제된 공간데이터 현황 업데이트
                props.setRegAndModifyStatus("DeleteFeature", geomType).then(function () { });
            }

            //추가, 변경, 삭제된 공간데이터를 배열에 추가(동일한 피쳐에 대해 중복처리하지 않기위함)
            if (statusArr.includes(feature.ol_uid) == false) {
                statusArr.push(feature.ol_uid);//수정 리스트 배열에 값이 없을경우 추가
                setStatusArr(statusArr);//배열에 변경이 있음을 React에게 알림
            }
        }
    }
    /* END 자식 컴포넌트에서 부모 컴포넌트로 데이터 전달 END */

    /* USER EFECT 이벤트 리스너 */
    useEffect(() => {

        /* START 지도 객체 선언 및 기본 세팅 START */
        const map = new OlMap({
            layers: [
                tileLayerXYZ,
                vectorLayer
            ],
            target: 'map',
            view: new View({
                //projection: getProjection('EPSG:3857'),
                //center: fromLonLat([126.752, 37.4713], getProjection('EPSG:3857')),
                center: [126.97659953, 37.579220423], //포인트의 좌표를 리턴함
                projection: 'EPSG:4326',//경위도 좌표계 WGS84
                zoom: 6
            })
        });

        const view = map.getView();
        const zoom = view.getZoom();

        setView(view);//컴포넌트 전역 뷰 정보 할당
        setZoom(zoom);//컴포넌트 전역 줌레벨 할당
        setMap(map);//컴포넌트 전역 지도 오브젝트 할당

        map.addInteraction(selectSingleClick);
        /* END 지도 객체 선언 및 기본 세팅 END */

        /* START 수정 인터렉션 세팅 START */
        const defaultStyle = new Modify({ source: source })
            .getOverlay()
            .getStyleFunction();

        let modify = new Modify({
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

        modify.on('modifystart', function (event) {
            setIsDraw(true);
            console.log("수정 시작" + isDraw);

            event.features.forEach(function (feature) {
                const geometry = feature.getGeometry();
                if (geometry.getType() === 'GeometryCollection') {
                    feature.set('modifyGeometry', geometry.clone(), true);
                }
            });
        });

        modify.on('modifyend', function (event) {
            setIsDraw(false);
            console.log("수정 종료" + isDraw);

            event.features.forEach(function (feature) {
                const modifyGeometry = feature.get('modifyGeometry');
                if (modifyGeometry) {
                    feature.setGeometry(modifyGeometry);
                    feature.unset('modifyGeometry', true);
                }

                sendRegAndModifyStatus("Update", feature);//현황판(부모 컴포넌트)에 결과 전달
            });
        });

        map.addInteraction(modify);
        /* END 수정 인터렉션 세팅 END */

        /* 지도 클릭시 해당 위치의 정보 표출 */
        map.on('click', function (evt) {

            updateStyles();

            if (isDraw == true) { return false }

            console.log("지도 클릭시 위치정보 Overlay : " + evt.pixel);
            let popupMap = new Overlay({
                element: document.getElementById('popupMap'),
            });
            map.addOverlay(popupMap);

            let elementMap = popupMap.getElement();
            let popoverMap = Popover.getInstance(elementMap);//팝오버 객체 생성
            let coordinate = evt.coordinate;

            let hdms = toStringHDMS(toLonLat(coordinate));
            let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) { return feature; });//피쳐가 있을시 피쳐를 반환

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


                let popupFeature = new Overlay({
                    element: document.getElementById('popup'),
                });
                map.addOverlay(popupFeature);
                let elementFeature = popupFeature.getElement();
                let popoverFeature = Popover.getInstance(elementFeature);//팝오버 객체 생성

            }
            else {
                //팝오버 존재시 숨기기
                if (popoverMap != null) {
                    popoverMap.hide();
                }
            }
        });

        /* 지도 포인트 이동시 이벤트 */
        map.on('pointermove', function (e) {
            if (!e.dragging) {
                var pixel = map.getEventPixel(e.originalEvent);
                var hit = map.hasFeatureAtPixel(pixel);
            }
        });

        /* END 지도 객체 선언 및 기본 세팅 END */
        return () => null
    }, []);


    /* Feature Draw시 동학하며 마지막 포인트를 없애 이전으로 돌아간다. */
    const removeLastPoint = async () => {
        draw.removeLastPoint();
    };

    // 이번트 리스너 동작시 피쳐의 State Type 별 스타일 
    const updateStyles = () => {
        const features = vectorLayer.getSource().getFeatures();

        features.forEach(feature => {
            const state = feature.getProperties().state;

            if (state === 'delete') {
                feature.setStyle(new Style({
                    fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }),
                    stroke: new Stroke({ color: 'rgba(0, 0, 0, 0)', width: 0 })
                }));
            } else {
                /*
                feature.setStyle(new Style({
                    fill: new Fill({ color: 'rgba(255, 255, 255, 0.6)' }),
                    stroke: new Stroke({ color: '#319FD3', width: 1 })
                }));
                */
            }
        });
    };

    /* 셀렉트박스 이벤트 헨들러 */
    const handleClick = async (zoomType) => {
        let currentZoom = view.getZoom();

        if (zoomType == 'zoomIn') {
            view.setZoom(currentZoom + 1);
        }
        else if (zoomType == 'zoomOut') {
            view.setZoom(currentZoom - 1);
        }
    };

    //지도 초기화
    const initMap = async (e) => {

        mapObj.removeInteraction(draw);
        mapObj.removeInteraction(snap);

        addInteractions(e)
    };

    let snap; let draw;
    const addInteractions = async (e) => {

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
        snap = new Snap({ source: source });

        mapObj.addInteraction(draw);
        mapObj.addInteraction(snap);

        drawType = e.target.value;
        setIsDraw(true);

        select.set("drawYn", "Y")
    }

    /* Map 객채에 특정 인터렉션(Interation)을 제거 */
    function removeInteraction(interactionType) {

        if (interactionType == "draw") {
            console.log("인터렉션 제거! : draw");
            mapObj.removeInteraction(draw);
            setIsDraw(false);
        }
        else if (interactionType == "snap") {
            mapObj.removeInteraction(snap);
        }
    }

    /* Select 이벤트 발생시 해당 이벤트의 정보 */
    const selectFeatureInfoBox = async (event, selectType) => {

        if (selectType == "FEATURE") {

            document.getElementById('status').innerHTML =
                event.target.getFeatures().getLength() + '개의 공간데이터가 선택되었습니다. (마지막 작업에서 ' +
                event.selected.length + '개가 선택되었고 ' +
                event.deselected.length + '개가 선택 취소 되었습니다.)';
        }
        else {
            document.getElementById('status').innerHTML = "지도 클릭 선택된 피쳐가 없습니다."
        }
    };

    let drawType;
    source.on('addfeature', function (e) {

        //피쳐 추가시 Type Propertiy 세팅
        if (drawType == 'Geodesic') {
            console.log("피쳐추가 Geodesic");
            e.feature.set('realType', 'GeometryCollection');
            e.feature.set('type', 'Geodesic');
        }
        else if (drawType == 'Circle') {
            console.log("피쳐추가 Circle");
            e.feature.setProperties({ 'realType': 'Circle', 'type': 'Circle' })
        }
        else if (drawType == 'Polygon') {
            console.log("피쳐추가 Polygon");
            e.feature.setProperties({ 'realType': 'Polygon', 'type': 'Polygon' })
        }
        else if (drawType == 'LineString') {
            console.log("피쳐추가 LineString");
            e.feature.setProperties({ 'realType': 'LineString', 'type': 'LineString' })
        }
        else if (drawType == 'Point') {
            console.log("피쳐추가 Point");
            e.feature.setProperties({ 'realType': 'Point', 'type': 'Point' })
        }

        if (drawType != undefined) {
            flash(e.feature);
        }
    });

    /* 생성한 피쳐를 맵에 추가 */
    const duration = 3000;
    const flash = async (feature) => {

        const start = Date.now();
        const flashGeom = feature.getGeometry().clone();
        const listenerKey = tileLayerXYZ.on('postrender', animate);

        function animate(event) {
            const frameState = event.frameState;
            const elapsed = frameState.time - start;

            if (elapsed >= duration) {
                unByKey(listenerKey);
                return;
            }

            const vectorContext = getVectorContext(event);
            const elapsedRatio = elapsed / duration;

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
            mapObj.render();
        }

        removeInteraction("draw");// Draw Interation 종료

        /*  
            ※ React에서는 한 컴포넌트가 렌더링 중일 때 다른 컴포넌트의 상태를 업데이트하려는 시도를 금지(오류를 일으킴)합니다. ※

            아래에 await new Promise((resolve) => setTimeout(resolve, 0)); 코드를 넣지 않았을 경우

            1. 해당 컴포넌트에서 mapObj를 랜더링 작업1. -> mapObj.render();    : 지도에 피쳐 추가
            2. 해당 컴포넌트에서 mapObj를 랜더링 작업2. -> removeInteraction;  : 객체에 Draw인터렉션 제거

            -> 모두 해당 컴포넌트를 재랜더링 하는 과정

            3. 이과정이 이루어지는 도중 부모컴포넌트 openlayers.js의 상태 업데이트 시도 -> sendRegAndModifyStatus("Insert", feature);

            -> 부모와 자식컴포넌트를 동시에 랜더링 하려하므로, 컴포넌트 사이의 랜더링 충돌 오류 발생

            동시에 작업이 처리되지 않도록 openlayers.js 컴포넌트의 처리를 비동기로 하여 순차실행으로 충돌하지 않도록 조치
        */

        setParnetActionType('getSource');
        await new Promise((resolve) => setTimeout(resolve, 0));
        sendRegAndModifyStatus("Insert", feature);// 현황판(부모 컴포넌트)에 결과 전달
        await new Promise((resolve) => setTimeout(resolve, 0));
        select.set("drawYn", "N");// Draw Inteeraction 종료 변수 추가
        setParnetActionType('null');
    }

    /**
     * 지도 클릭시 피쳐가 있을경우 해당 피쳐의 정보 표출
     */
    let select = selectSingleClick;
    select.on('select', function (e) {

        if (e.target.getFeatures().getLength() != 0) {
            //셀렉트 이벤트시 피쳐가 있을때 정보표출
            selectFeatureInfoBox(e, "FEATURE");

            e.target.getFeatures().forEach(function (feature, idx) {

                let geomType = feature.getProperties().type;
                let center;

                //피쳐 추가시 Type Propertiy 세팅
                if (geomType == 'Geodesic') {
                    console.log('Geodesic');
                    center = getCenter(feature.getGeometry().getExtent());
                }
                else if (geomType == 'Circle') {
                    console.log('Circle');
                    center = feature.getGeometry().getCenter();
                }
                else if (geomType == 'Polygon') {
                    console.log('Polygon');
                    center = getCenter(feature.getGeometry().getExtent());
                }
                else if (geomType == 'LineString') {
                    console.log('LineString');
                    center = getCenter(feature.getGeometry().getExtent());
                }
                else if (geomType == 'Point') {
                    console.log('Point');
                    center = feature.getGeometry().getCoordinates();
                }

                //if(popupFeature == undefined){return false}
                if (mapObj == undefined) { return false }

                const popupFeature = new Overlay({
                    element: document.getElementById('popup'),
                });

                mapObj.addOverlay(popupFeature);
                const elementFeature = popupFeature.getElement();
                let popoverFeature = Popover.getInstance(elementFeature);//팝오버 객체 생성

                //popup.setPosition(coordinate);
                popupFeature.setPosition(center);

                setPopoverFeature(popoverFeature);

                if (popoverFeature) {
                    popoverFeature.dispose();
                }

                // 팝오버 내용에 삭제 버튼 추가
                const contentHtml = `
                    <p>클릭한 위치의 피쳐 정보111</p>
                    <code>${center}</code>
                    <code>${feature.getProperties()}</code>
                    <div class="popover-footer d-flex justify-content-end gap-2 mt-2">
                        <a id="popover-delete-btn" class="btn btn-danger btn-sm">삭제하기</a>
                        <a id="popover-close-btn" class="btn btn-warning btn-sm">팝업닫기</a>
                    </div>
                `;


                popoverFeature = new Popover(elementFeature, {
                    animation: false,
                    container: elementFeature,
                    content: contentHtml,
                    html: true,
                    placement: 'top',
                    title: 'Welcome to OpenLayers',
                });

                //팝오버 표출
                popoverFeature.show();

                // 닫기 버튼 클릭 이벤트 추가
                document.getElementById('popover-close-btn').addEventListener('click', function () {
                    //alert("팝업 창을 닫을게요.");
                    popoverFeature.hide();
                });

                // 닫기 버튼 클릭 이벤트 추가
                document.getElementById('popover-delete-btn').addEventListener('click', function () {

                    // eslint-disable-next-line no-restricted-globals
                    const userConfirmed = confirm("피쳐를 삭제 할까요?");

                    if (userConfirmed) {

                        let featureIdToDelete = feature.getId();

                        const source = vectorLayer.getSource();

                        // 소스에서 특정 ID와 일치하는 피쳐 찾기
                        const featureToDelete = source.getFeatures().find(f => f.getId() === featureIdToDelete);


                        if (featureToDelete) {
                            //팝업 닫기
                            popoverFeature.hide();

                            // 프로퍼티 변경
                            featureToDelete.setProperties({ 'state': 'delete' });
                            
                            // 피쳐를 벡터 레이어에서 제거
                            //source.removeFeature(featureToDelete);

                            // 피쳐의 스타일 변경하여 숨기기
                            featureToDelete.setStyle(new Style({
                                display: 'none' // 스타일로 숨기기 (개별 스타일 설정 필요)
                            }));

                            featureToDelete.setStyle(new Style({
                                fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }), // 투명한 채우기
                                stroke: new Stroke({ color: 'rgba(0, 0, 0, 0)', width: 0 }) // 투명한 테두리
                            }));

                            sendRegAndModifyStatus("Delete", feature);//현황판(부모 컴포넌트)에 결과 전달

                            console.log(`피쳐 ID ${featureIdToDelete}가 삭제되었습니다.`);
                        } else {
                            console.log(`피쳐 ID ${featureIdToDelete}를 찾을 수 없습니다.`);
                        }
                    }
                });

            });
        }
    });


    /**
     * 지도 클릭시 피쳐가 없는 부분에 팝업 띄우기
     */
    const deleteSelectFeautre = function () {
        alert("피쳐삭제");
    }


    /**
     * 지도 클릭시 피쳐가 없는 부분에 팝업 띄우기
     */
    const changeInteraction = function (clickType) {
        console.log("지도 클릭 이벤트!");
        if (select !== null) {
            mapObj.removeInteraction(select);
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

            mapObj.addInteraction(select);

            select.on('select', function (e) {

                if (e.target.getFeatures().getLength() != 0) {
                    //셀렉트 이벤트시 피쳐가 있을때 정보표출
                    selectFeatureInfoBox(e, "MAP");

                    e.target.getFeatures().forEach(function (feature, idx) {

                        let geomType = feature.getProperties().type;
                        let center;

                        //피쳐 추가시 Type Propertiy 세팅
                        if (geomType == 'Geodesic') {
                            console.log('Geodesic');
                            center = getCenter(feature.getGeometry().getExtent());
                        }
                        else if (geomType == 'Circle') {
                            console.log('Circle');
                            center = feature.getGeometry().getCenter();
                        }
                        else if (geomType == 'Polygon') {
                            console.log('Polygon');
                            center = getCenter(feature.getGeometry().getExtent());
                        }
                        else if (geomType == 'LineString') {
                            console.log('LineString');
                            center = getCenter(feature.getGeometry().getExtent());
                        }
                        else if (geomType == 'Point') {
                            console.log('Point');
                            center = feature.getGeometry().getCoordinates();
                        }

                        const popupFeature = new Overlay({
                            element: document.getElementById('popup'),
                        });
                        mapObj.addOverlay(popupFeature);
                        const elementFeature = popupFeature.getElement();
                        let popoverFeature = Popover.getInstance(elementFeature);//팝오버 객체 생성

                        popupFeature.setPosition(center);

                        if (popoverFeature) {
                            popoverFeature.dispose();
                        }

                        // 팝오버 내용에 삭제 버튼 추가
                        const contentHtml = `
                            <p>클릭한 위치의 피쳐 정보 222</p>
                            <code>${center}</code>
                            <br>
                            <button id="popover-close-btn" class="btn btn-danger btn-sm" >삭제</button>
                        `;

                        popoverFeature = new Popover(elementFeature, {
                            animation: false,
                            container: elementFeature,
                            content: contentHtml,
                            html: true,
                            placement: 'top',
                            title: 'Welcome to OpenLayers',
                        });

                        //팝오버 표출
                        popoverFeature.show();
                    });
                }
                else {
                    /* 피쳐가 없음 */
                }
            });
        }
    };

    source.on('selectfeature', function (e) {

        select.set("drawYn", "N");
        flash(e.feature);
    });


    /* ※미사용※ 저장된 지오메트릭 데이터 불러오기 (부모 컴포넌트로 이동시킴) */
    const callFeature = async (feature) => {

        let response = await axios({
            method: 'get',
            url: '/api/geomboardList',
            params: {
                id: "Fature Call!"
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        })

        var datas = response.data.rows;
        var array = Object.values(datas)

        /* 피쳐보이기 부터 해보자 */
        const featureArr = [];

        const promises = datas.map(async (value, index) => {

            let feature = new GeoJSON().readFeature(value.geom_value);

            let geometry = new GeoJSON().readFeature(value.geom_value);
            let properties = JSON.parse(value.geom_prop);
            let geomType = properties.type;

            // 원일 경우 Center와 Radius를 이용해 추가.
            if (geomType == 'Circle') {
                //console.log('--- Set Circle ---');
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
        });

        await Promise.all(promises);

        source.addFeatures(featureArr);
    }


    /* 지도 맵 컨트롤 HTML */
    return (
        <>
            <Row>
                <div id="map" value={mapObj}></div>
            </Row>

            <Row className='my-3'>
                <Col className="text-center" id="status" >{featureInfo}</Col>
            </Row>

            <Row className='mb-3'>
                <Col>
                    <Button variant="outline-success" className="btn_type1" onClick={sendSourceToParents}>저장하기</Button>
                </Col>
            </Row>

            <Row className='mb-3'>
                <Col>
                    <div className="input-group">
                        <label className="input-group-text" htmlFor="type">Geometry type</label>
                        <Form.Select id="type" onChange={(e) => { initMap(e); }} value={drawType}>
                            <option key={0} value="" >선택하세요</option>
                            <option key={1} value="Point" >Point</option>
                            <option key={2} value="LineString">LineString</option>
                            <option key={3} value="Polygon">Polygon</option>
                            <option key={4} value="Circle">Circle Geometry</option>
                            <option key={5} value="Geodesic">Geodesic Circle</option>
                        </Form.Select>
                        <Button variant="outline-primary" onClick={(e) => { removeLastPoint(); }}>이전으로</Button>
                    </div>
                </Col>
                <Col>
                    <div className="input-group">
                        <label className="input-group-text" htmlFor="type2">Action type &nbsp;</label>

                        <Form.Select id="type2" onChange={(e) => { changeInteraction(e.target.value); }} defaultValue={"none"}>
                            <option key={1} value="click">Click</option>
                            <option key={2} value="singleclick">Single-click</option>
                            <option key={3} value="pointermove">Hover</option>
                            <option key={4} value="altclick">Alt+Click</option>
                            <option key={5} value="none">None</option>
                        </Form.Select>
                    </div>
                </Col>
            </Row>

            {/* 
            <ReactBootstrapPopover id="popover-basic">
                <ReactBootstrapPopover.Header as="h3">Popover Header</ReactBootstrapPopover.Header>
                <ReactBootstrapPopover.Body>
                    This is the popover content. You can put anything here!
                </ReactBootstrapPopover.Body>
            </ReactBootstrapPopover> 
            */}

            <div id="popup"></div>
            <div id="popupMap"></div>
            <div id="selectPopup"></div>
        </>
    );
});

export default Map;

