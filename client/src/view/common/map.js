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



const snap = new Snap({source: source});

export const Map1 = (/*{ children, zoom, center }*/) => {

    const [mapObj, setMap] = useState();
    const [isDraw, setIsDraw] = useState(false);
    const [view, setView] = useState();
    const [zoom, setZoom] = useState();


    
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

        
        setMap(map);
        setView(view);
        setZoom(zoom);

        return ()=> null
    },  []);

    //지도 초기화
    const initMap =  async (e) => {

        mapObj.removeInteraction(draw);
        mapObj.removeInteraction(snap);

        addInteractions(e);
    };

    /* Feature Draw시 동학하며 마지막 포인트를 없애 이전으로 돌아간다. */
    const removeLastPoint = async () => {
        draw.removeLastPoint();
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

        mapObj.addInteraction(draw);
        mapObj.addInteraction(snap);


        setIsDraw(true);
    }
    /*
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
    */
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

                        {/* <Form.Select id="type2" onChange={(e) => { changeInteraction(e.target.value);}} defaultValue={"none"}>
                            <option key={1} value="click">Click</option>
                            <option key={2} value="singleclick">Single-click</option>
                            <option key={3} value="pointermove">Hover</option>
                            <option key={4} value="altclick">Alt+Click</option>
                            <option key={5} value="none">None</option>
                        </Form.Select> */}
                    </div>
                </Col>
            </Row>
        </>
    );
}
  
export default Map1;

