import React, { useState, useEffect } from 'react';

import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

const TSPMap = () => {
  const [map, setMap] = useState(null);
  let pointsList=[[37.013648, -1.104559],[37.014874, -1.104333],[37.016515, -1.102996],[37.016752, -1.101590],[37.019720, -1.102568],[37.018204, -1.096019],[37.010356, -1.101170],[37.02092, -1.099306],[37.012721, -1.101331]];
  const [initialPoints,setInitialPoints] = useState(pointsList);

  // Sample GeoJSON data
  const geojsonData = {
    type: 'FeatureCollection',
    features: initialPoints.map(coord=>({
      type:"Feature",
      properties:{"GarbageHeight":Math.floor(Math.random()*10)},
      geometry:{
        type:"Point",
        coordinates:coord.reverse(),
      }
    })),
  };

  const [geojson, setGeojson] = useState(geojsonData);

  var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  });

  useEffect(() => {
    if (!map) {
      const leafletMap = L.map('map', { layers: [osm] }).setView(geojson.features[0].geometry.coordinates, 13);
      setMap(leafletMap);
    }
  }, [map, geojson]);

  useEffect(() => {
    if (map && geojson.features.length > 2) {
      const waypoints = geojson.features.map(feature => L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]));
      const markerGroup = L.layerGroup();

      const optimizedRoute = solveTSP(waypoints);
      console.log(optimizedRoute);

      // Clear existing layers
      map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });

      waypoints.forEach((waypoint, index) => {
        let marker = L.marker(waypoint, { icon: redIcon })
          .bindPopup(`Point ${index + 1}`)
          .openPopup();
        markerGroup.addLayer(marker);
      });
      //map.addLayer(markerGroup);
      var poi=L.geoJSON(geojson,{
        onEachFeature:(feature,layer)=>{
          layer.bindPopup(`<b>Garbage Height </b>${feature.properties.GarbageHeight}`)
      },
      pointToLayer:(feature,latlng)=>{
        return L.marker(latlng,{icon:redIcon});
      }
    })

    poi.addTo(map);
      let route = L.Routing.control({
        waypoints: optimizedRoute.waypoints,
        routeWhileDragging: true,
        createMarker: () => null,
      });
      route.addTo(map);

      var TSP = L.polyline(optimizedRoute.waypoints, { color: 'blue' });

      var baseMaps = {
        "OSM": osm
      };
      var overlays = {
        "Points": markerGroup,
        "TSP": TSP,
      };
      L.control.layers(baseMaps, overlays).addTo(map);

      map.fitBounds(L.latLngBounds(optimizedRoute.waypoints));
    }
  }, [map, geojson]);

  const solveTSP = (waypoints) => {
    const order = [waypoints[0]]; // Starting from the first waypoint

    while (order.length < waypoints.length) {
      let currentWaypoint = order[order.length - 1];
      let minDistance = Number.MAX_VALUE;
      let nextWaypoint = null;

      waypoints.forEach(waypoint => {
        if (!order.includes(waypoint)) {
          const distance = currentWaypoint.distanceTo(waypoint);
          if (distance < minDistance) {
            minDistance = distance;
            nextWaypoint = waypoint;
          }
        }
      });

      order.push(nextWaypoint);
    }
    console.log(order);
    return {
      waypoints: order,
    };
  };


  return (
    <div id="map" style={{ height: '100vh', width: '100%' }} />
  );
};

export default TSPMap;