import React, { useRef } from "react";
import ReactDOM, { render } from "react-dom";
import { geoJSON, Map, Projection, point } from "leaflet";
import { basemapLayer, featureLayer, get, Util } from "esri-leaflet";
import "../node_modules/leaflet/dist/leaflet.css";
import "./App.css";
import mi from "./images/marker-icon.png";
import "./images/marker-icon-2x.png";
import "./images/marker-shadow.png";

console.log(mi);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();

    this.setMapReference = (element) => {
      this.map = new Map(element).setView([45.528, -122.68], 13);
    };
  }
  componentDidMount() {

    // Imagery or Topographic
    basemapLayer("Topographic").addTo(this.map);

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

        const geojson = geoJSON(featureCollection).addTo(this.map);
        this.map.fitBounds(geojson.getBounds());
      }
    );
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
