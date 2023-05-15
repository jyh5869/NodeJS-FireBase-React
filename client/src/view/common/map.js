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

//data/geojson/switzerland.geojson
//import '../../assets/css/flower.css';
import GeojsonTest from '../../openLayers/examples/data/geojson/switzerland.geojson';

const source1 = new VectorSource({
    url: GeojsonTest,
    format: new GeoJSON(),
});

const vectorLayer = new VectorLayer({
  source: source1,
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



function Map1({ name, ...props }) {
    const [show, setShow] = useState(false);
  
    const handleClose = () => setShow(false);
    const toggleShow = () => setShow((s) => !s);
    

    const map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          }),
          vectorLayer 
        ],
        view: new View({
          center: [ 126.97659953, 37.579220423 ], //포인트의 좌표를 리턴함
          projection : 'EPSG:4326',
          zoom: 7 ,
        })
      });



    map.on('click', function(evt) {
    
        //var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        let coordinate = evt.coordinate;
        console.log(coordinate);
    })

    
    const handleClick = async (zoomType) => {

      const view = map.getView();
      const zoom = view.getZoom();

      if(zoomType == 'zoomIn'){
        view.setZoom(zoom + 1);
      }
      else if(zoomType == 'zoomOut'){
        view.setZoom(zoom - 1);
      }

      
    };
    const Switzerland = async () => {
          const view = map.getView();
          
          const feature = source1.getFeatures()[0];
          console.log(feature);
          const polygon = feature.getGeometry();

          view.fit(polygon, {padding: [170, 50, 30, 150]});

    };

    return (
        <>
          <link rel="stylesheet" href="node_modules/ol/ol.css"></link>
          <div id="map"></div>
          <button id="zoomtoswitzerland" onClick={(e) => { Switzerland('zoomOut');}}>Zoom to Switzerland</button>
          <button id="zoom-out" onClick={(e) => { handleClick('zoomOut');}}>Zoom out</button>
          <button id="zoom-in" onClick={(e) => { handleClick('zoomIn');}}>Zoom in</button>
        </>
      );
  }
  
  
export default Map1;
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

});*/