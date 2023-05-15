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

    return (
        <>
            <link rel="stylesheet" href="node_modules/ol/ol.css"></link>
            <div id="map"></div>
            <button id="zoomtoswitzerland" onClick={(e) => { Switzerland();}}>Zoom to Switzerland</button>
            <button id="zoomtolausanne" onClick={(e) => { ZoomToLausanne();}}>Zoom to Lausanne</button>
            <button id="centerlausanne" onClick={(e) => { CenterOnLausanne();}}>Center on Lausanne</button><br/><br/>
            <button id="zoom-out" onClick={(e) => { handleClick('zoomOut');}}>Zoom out</button>
            <button id="zoom-in" onClick={(e) => { handleClick('zoomIn');}}>Zoom in</button>
        </>
    );
}
  
export default Map1;