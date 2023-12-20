import React,  { useEffect, useRef ,useState } from 'react';

import { Button, Table, Form, Badge, Stack, Container, Row, Col }   from 'react-bootstrap';

import axios from 'axios';
/*
교육 URL
https://openlayers.org/en/latest/examples/center.html
https://dev.to/camptocamp-geo/integrating-an-openlayers-map-in-vue-js-a-step-by-step-guide-2n1p
*/
import '../../assets/css/map.css';
import 'ol/ol.css';
import {Map as OlMap} from 'ol';
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

import {get as getProjection } from 'ol/proj.js'; //위경도


import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {toStringHDMS} from 'ol/coordinate.js';

import GeojsonTest from '../../openLayers/examples/data/geojson/switzerland.geojson';

import {Popover} from 'bootstrap';

const tileLayerXYZ = new TileLayer({
    source: new XYZ({ //source: new OSM()
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    })
});

const tileLayerOSM = new TileLayer({
    source: new OSM()
});

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

const snap = new Snap({source: source});

let select = selectSingleClick;
export const Map1 = (/*{ children, zoom, center }*/) => {

    const [mapObj, setMap] = useState();
    const [isDraw, setIsDraw] = useState(false);
    const [view, setView] = useState();
    const [zoom, setZoom] = useState();
    const [drawType, setDrawType] = useState();

    const [draw, setDraw] = useState();
    const [modify, setModify] = useState();

    const [popupFeature, setPopupFeature] = useState();
    const [popupMap, setPopupMap] = useState();

    const [elementFeature, setElementFeature] = useState();
    const [elementMap, setElementMap] = useState();

    const [popoverFeature, setPopoverFeature] = useState();
    const [popoverMap, setPopoverMap] = useState();
    
    //이벤트 리스너
    useEffect(() => {
        const map = new OlMap({
            layers: [
                tileLayerXYZ,
                vectorLayer
            ],
            target: 'map', 
            view: new View({
                projection: getProjection('EPSG:3857'),
                center: fromLonLat([126.752, 37.4713], getProjection('EPSG:3857')),
                zoom: 13
            })
        })
        
        const view = map.getView();
        const zoom = view.getZoom();

        


        const popupFeature = new Overlay({
            element: document.getElementById('popup'),
        });
        const popupMap = new Overlay({
            element: document.getElementById('popupMap'),
        });

        map.addOverlay(popupFeature);
        map.addOverlay(popupMap);

        const elementFeature = popupFeature.getElement();
        const elementMap = popupMap.getElement();

        const popoverFeature = Popover.getInstance(elementFeature);//팝오버 객체 생성
        const popoverMap = Popover.getInstance(elementMap);//팝오버 객체 생성

        setView(view);
        setZoom(zoom);

        setElementMap(elementMap);
        setElementFeature(elementFeature);

        setPopoverFeature(popoverFeature);
        setPopoverMap(popoverMap);


        map.addInteraction(selectSingleClick);
        console.log("로드시 isdraw : " + isDraw);

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

        //Map 객채에 수정 인터렉션(Interation) 추가
        map.addInteraction(modify);
        setModify(modify);

        modify.on('modifystart', function (event) {
            console.log("수정 시작");
            setIsDraw(true);
            event.features.forEach(function (feature) {
                const geometry = feature.getGeometry();
                if (geometry.getType() === 'GeometryCollection') {
                    feature.set('modifyGeometry', geometry.clone(), true);
                }
            });
        });
    
        modify.on('modifyend', function (event) {
            console.log("수정 종료");
            setIsDraw(false);
            event.features.forEach(function (feature) {
                const modifyGeometry = feature.get('modifyGeometry');
                if (modifyGeometry) {
                    feature.setGeometry(modifyGeometry);
                    feature.unset('modifyGeometry', true);
                }
            });
        });
        
        setMap(map);

        return ()=> null
    },  []);


    

    
    

    /* Feature Draw시 동학하며 마지막 포인트를 없애 이전으로 돌아간다. */
    const removeLastPoint = async () => {
        draw.removeLastPoint();
    };


    //지도 초기화
    /**
     * 
     *  ??? isDraw 왜자꾸 안바꼉?
     */
    const initMap = async (e) => {
        


        mapObj.removeInteraction(draw);
        mapObj.removeInteraction(snap);
        console.log("remove draw!!  " +  isDraw);
        setIsDraw(true);
        //setTimeout(() =>console.log("3초 지연!") , 3000);
        addInteractions(e)
    };

    let snap;
    function addInteractions(e) {
        
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

        let draw = new Draw({
            source: source,
            type: value,
            geometryFunction: geometryFunction,
        });
        snap = new Snap({source: source});
        
        mapObj.addInteraction(draw);
        mapObj.addInteraction(snap);

        setDraw(draw);
        setDrawType(e.target.value);
        
        console.log('isDraw = ' + isDraw);
    }

    //Map 객채에 특정 인터렉션(Interation)을 제거
    function removeInteraction(interactionType){

        if(interactionType == "draw"){
            mapObj.removeInteraction(draw);
            setIsDraw(false);
        }
        else if(interactionType == "snap"){
            mapObj.removeInteraction(snap);
        }
    }

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

        if(drawType != undefined){
            flash(e.feature);
        } 
    });
    
    /* 생성한 피쳐를 맵에 추가 */
    const duration = 3000;
    const  flash = async(feature) => {
        console.log("피쳐 추가!");

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
            mapObj.render();
        }

        //Draw Interation 종료
        removeInteraction("draw");
        console.log("isdraw: 그리기종료 후 :  " + isDraw);
    }


    select.on('select', function (e) {
        console.log("select isdraw = " + isDraw);

        if(isDraw == false){ return false}

        selectFeatureInfoBox(e, "FEATURE");

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
                
                //popup.setPosition(coordinate);
                popupFeature.setPosition(center);
                
                if (popoverFeature) {
                    popoverFeature.dispose();
                }
                
                popoverFeature = new Popover(elementFeature, {
                    animation: false,
                    container: elementFeature,
                    content: '<p>클릭한 위치의 피쳐 정보:</p><code>' + center + '</code>',
                    html: true,
                    placement: 'top',
                    title: 'Welcome to OpenLayers',
                });
    
                //팝오버 표출
                popoverFeature.show();
            });
        }      
    });


    const changeInteraction = function (clickType) {
        console.log(select);
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
                        
                        popupFeature.setPosition(center);
                        
                        if (popoverFeature) {
                            popoverFeature.dispose();
                        }
                        
                        popoverFeature = new Popover(elementFeature, {
                            animation: false,
                            container: elementFeature,
                            content: '<p>클릭한 위치의 피쳐 정보:</p><code>' + center + '</code>',
                            html: true,
                            placement: 'top',
                            title: 'Welcome to OpenLayers',
                        });
            
                        //팝오버 표출
                        popoverFeature.show();
                    });
                }      
            });
        }
    };


    
        
    //console.log(modify);
    



    return (
        <>
            {/* <div ref={mapId} className='map'>
                {children}
            </div> */}

            <div id="map" value={mapObj} style={{height:'50rem'}}></div>

            <Row className='mb-3'>
                <Col>
                    <div className="input-group">
                        <label className="input-group-text" htmlFor="type">Geometry type</label>
                        <Form.Select id="type" onChange={(e) => { initMap(e); } } value={drawType}>
                            <option key={0} value="" >선택하세요</option>
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
        </>
    );
}
  
export default Map1;

