import React, { useRef } from "react";
import ReactDOM, { render } from "react-dom";
import { circleMarker, geoJSON, LatLng, Map, marker, Projection, point } from "leaflet";
import { basemapLayer, featureLayer, get, Util } from "esri-leaflet";
import { MarkerClusterGroup } from "leaflet.markercluster";
import "../node_modules/leaflet/dist/leaflet.css";
import "../node_modules/leaflet.markercluster/dist/MarkerCluster.css";
import "../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./App.css";

// import L from 'leaflet';
// delete L.Icon.Default.prototype._getIconUrl;
// import mi from "./images/marker-icon.png";
// import "./images/marker-icon-2x.png";
// import "./images/marker-shadow.png";

// console.log(mi);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();

    this.setMapReference = (element) => {
      this.map = new Map(element).setView([0, 0], 3);
    };
  }
  componentDidMount() {
    // Imagery or Topographic
    basemapLayer("DarkGray").addTo(this.map);

    get(
      "https://www.arcgis.com/sharing/content/items/62914b2820c24d4e95710ebae77937cb/data",
      {},
      (error, response) => {
        if (error) {
          return;
        }

        const features =
          response.operationalLayers[0].featureCollection.layers[0].featureSet
            .features;
        const idField =
          response.operationalLayers[0].featureCollection.layers[0]
            .layerDefinition.objectIdField;

        // empty geojson feature collection
        const featureCollection = {
          type: "FeatureCollection",
          features: [],
        };

        for (var i = features.length - 1; i >= 0; i--) {
          // convert ArcGIS Feature to GeoJSON Feature
          const feature = Util.arcgisToGeoJSON(features[i], idField);
          console.log(feature);

          // unproject the web mercator coordinates to lat/lng
          const latlng = Projection.Mercator.unproject(
            point(feature.geometry.coordinates)
          );
          feature.geometry.coordinates = [latlng.lng, latlng.lat];

          featureCollection.features.push(feature);
        }

        /*
        L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
         */

        var geojsonMarkerOptions = {
          radius: 8,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        };
        const geojson = geoJSON(featureCollection, {
          pointToLayer: (feature, latlng) => {
            return circleMarker(latlng, geojsonMarkerOptions);
          },
          onEachFeature: (feature, layer) => {
            // does this feature have a property named popupContent?
            if (feature.properties && feature.properties.Name) {
              layer.bindPopup(feature.properties.Name);
            }
          },
        }).addTo(this.map);
        // this.map.fitBounds(geojson.getBounds());
      }
    );

    // --------------------------------------------------------------------
    // Earthquakes as GeoJSON
    // --------------------------------------------------------------------
    const earthquakesURL =
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
    get(earthquakesURL, {}, (error, response) => {
      if (error) {
        return;
      }
      const geoJSONArray = response.features;
      console.log(JSON.stringify(geoJSONArray));

      var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff0000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      };
      const earthquakesGeoJSON = geoJSON(geoJSONArray, {
        pointToLayer: (feature, latlng) => {
          return circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: (feature, layer) => {
          // does this feature have a property named popupContent?
          if (feature.properties && feature.properties.Name) {
            layer.bindPopup(feature.properties.Name);
          }
        },
      }).addTo(this.map);
       this.map.fitBounds(earthquakesGeoJSON.getBounds());


       var markers = new MarkerClusterGroup();

		for (let location of geoJSONArray) {
			const title = location.properties.place;
			const point = location.geometry.coordinates;
			const symbol = new marker(new LatLng(point[1], point[0]), { title: title });
			symbol.bindPopup(title);
			markers.addLayer(symbol);
		}

		this.map.addLayer(markers);
    });
  }
  render() {
    return (
      <div>
        <div className="mapView" id="map" ref={this.setMapReference}></div>
      </div>
    );
  }
}

export default App;
