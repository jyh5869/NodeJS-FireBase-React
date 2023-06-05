import React,  { useEffect, useState } from 'react';
/*
교육 URL
https://openlayers.org/en/latest/examples/center.html

*/
import '../../assets/css/map.css';
import {Map} from 'ol';
import GeoJSON from 'ol/format/GeoJSON.js';
//import OSM from 'ol/source/OSM.js';
//import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import XYZ from 'ol/source/XYZ';

import {Draw, Modify, Snap} from 'ol/interaction.js';
import {GeometryCollection, Point, Polygon} from 'ol/geom.js';
import {circular} from 'ol/geom/Polygon.js';
import {getDistance} from 'ol/sphere.js';
import {transform} from 'ol/proj.js';

import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';

import GeojsonTest from '../../openLayers/examples/data/geojson/switzerland.geojson';

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

function Map1({}) {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    
    const map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
                source: new XYZ({ //source: new OSM()
                    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                })
            }),
            vectorLayer,
        ],
        view: new View({
            center: [ 126.97659953, 37.579220423 ], //포인트의 좌표를 리턴함
            projection : 'EPSG:4326',
            zoom: 7,
        })
    });

    const view = map.getView();
    const zoom = view.getZoom();

    map.on('click', function(evt) {
        //var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        let coordinate = evt.coordinate;
        console.log(coordinate);
    });
    
    const handleClick = async (zoomType) => {
        
        if(zoomType == 'zoomIn'){
          view.setZoom(zoom + 1);
        }
        else if(zoomType == 'zoomOut'){
          view.setZoom(zoom - 1);
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

        view.fit(point, {padding: [170, 50, 30, 150], minResolution: 50});
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

    modify.on('modifystart', function (event) {
        console.log("수정 시작");
        event.features.forEach(function (feature) {
            const geometry = feature.getGeometry();
            if (geometry.getType() === 'GeometryCollection') {
            feature.set('modifyGeometry', geometry.clone(), true);
            }
        });
    });

    modify.on('modifyend', function (event) {
        console.log("수정 종료");
        event.features.forEach(function (feature) {
            const modifyGeometry = feature.get('modifyGeometry');
            if (modifyGeometry) {
            feature.setGeometry(modifyGeometry);
            feature.unset('modifyGeometry', true);
            }
        });
    });

    //지도 초기화
    const initMap = async (e) => {
        console.log(e.target.value)
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        addInteractions(e);
        
    };

    let draw, snap; // global so we can remove them later
    function addInteractions(e) {
        
        let value = e.target.value;
        let geometryFunction;
        if (value === 'Geodesic') {
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
        map.addInteraction(draw);
        snap = new Snap({source: source});
        map.addInteraction(snap);
        
    }

    return (
        <>
            <link rel="stylesheet" href="node_modules/ol/ol.css"></link>
            <div id="map"></div>
            <button id="zoomtoswitzerland" onClick={(e) => { Switzerland();}}>Zoom to Switzerland</button>
            <button id="zoomtolausanne" onClick={(e) => { ZoomToLausanne();}}>Zoom to Lausanne</button>
            <button id="centerlausanne" onClick={(e) => { CenterOnLausanne();}}>Center on Lausanne</button><br/><br/>
            <button id="zoom-out" onClick={(e) => { handleClick('zoomOut');}}>Zoom out</button>
            <button id="zoom-in" onClick={(e) => { handleClick('zoomIn');}}>Zoom in</button>

            <form>
            <label for="type">Geometry type &nbsp;</label>
            <select id="type" onChange={(e) => { initMap(e);}}>
                <option value="Point">Point</option>
                <option value="LineString">LineString</option>
                <option value="Polygon">Polygon</option>
                <option value="Circle">Circle</option>
            </select>
            </form>
        </>
    );
}
  
export default Map1;