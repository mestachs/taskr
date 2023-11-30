import glify from "leaflet.glify";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@mui/material";
import turf from "../lib/support/turf";
import L from "leaflet";
L.glify = glify;

const multiPolygon2PolygonOnly = (geoJ) => {
  let polyOnly = { type: "FeatureCollection", features: [] };
  geoJ.features.forEach((f) => {
    let g = f.geometry;
    if (!g || !g.type) return;
    if (g.type == "Polygon") return polyOnly.features.push(f);
    if (g.type != "MultiPolygon") return;
    for (let i = 0, m = g.coordinates.length; i < m; i++) {
      polyOnly.features.push({
        ...f,
        geometry: { ...g, type: "Polygon", coordinates: g.coordinates[i] },
      });
    }
  });
  return polyOnly;
};

const bboxForPoints = (points) => {
  const result = [Infinity, Infinity, -Infinity, -Infinity];
  for (let point of points) {
    let coord = point.position;
    if (result[0] > coord[0]) {
      result[0] = coord[0];
    }
    if (result[1] > coord[1]) {
      result[1] = coord[1];
    }
    if (result[2] < coord[0]) {
      result[2] = coord[0];
    }
    if (result[3] < coord[1]) {
      result[3] = coord[1];
    }
  }

  return result;
};

export const OrgunitMap = ({ results }) => {
  const [clicked, setClicked] = useState("");
  const position = [-2.9593, 25.9359];
  const finalResults = results || [];
  const nonPoints = finalResults.filter(
    (r) => r.geom && r.geom.type != "Point"
  );
  const [map, setMap] = useState(null);

  const newRawPoints = finalResults.filter(
    (r) => r.geom && r.geom.type === "Point"
  );

  const geojsons = multiPolygon2PolygonOnly({
    type: "FeatureCollection",
    features: nonPoints.map((r) => {
      return {
        type: "Feature",
        geometry: r.geom,
        properties: {
          ...r,
          geom: null,
        },
      };
    }),
  });

  const size = 5;

  function onFeature(feature, event) {
    setClicked(feature);
  }
  function onEachFeature(feature, layer) {
    layer.on({
      click: (event) => onFeature(feature, event),
    });
  }

  const handleClickFitToBound = () => {
    if (map) {
      map._container.style.cursor = "crosshair";
      let bound = undefined;
      /*
      if (pointMarkers && pointMarkers.length > 0) {
        const bbox = bboxForPoints(pointMarkers);
        bound = bbox;
      }*/

      if (bound && bound[0] !== Infinity) {
        const southWest = L.latLng(bound[0], bound[1]);
        const northEast = L.latLng(bound[2], bound[3]);
        const bounds = L.latLngBounds(southWest, northEast);

        map.fitBounds(bounds);
      } else if (nonPoints && nonPoints.length > 0) {
        const functionPoly = turf.bbox;
        // only geojson
        var bboxPolygon = functionPoly({
          type: "FeatureCollection",
          features: nonPoints.map((r) => {
            return {
              type: "Feature",
              geometry: r.geom,
            };
          }),
        });

        if (bboxPolygon) {
          const southWest = L.latLng(bboxPolygon[1], bboxPolygon[0]);
          const northEast = L.latLng(bboxPolygon[3], bboxPolygon[2]);

          map.fitBounds([
            [bboxPolygon[1], bboxPolygon[0]],
            [bboxPolygon[3], bboxPolygon[2]],
          ]);
        }
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      handleClickFitToBound();
    }, 1000);
  }, [map]);

  useEffect(() => {
    if (map) {
      L.glify.shapes({
        map,
        data: geojsons,
        border: true,
        /* color: (i, f) => {
          return {r: 12, g: 12, b:0, a: 0.8 }
        },*/
        click: (e, feature) => {
          L.popup()
            .setLatLng(e.latlng)
            .setContent(
              "You clicked on ZONE : " + JSON.stringify(feature.properties)
            )
            .openOn(map);
          setClicked(feature);
        },
      });
      if (newRawPoints.length > 0) {
        L.glify.points({
          map: map,
          sensitivity: 0.5,
          size: function (i) {
            return map._zoom + 5;
          },
          hover: (e, feature) => {
            console.log("hovered on Point", feature, e);
          },
          click: (e, feature) => {
            setClicked(newRawPoints[feature[2]]);
            debugger;
            //set up a standalone popup (use a popup as a layer)
            L.popup()
              .setLatLng(feature)
              .setContent(
                `You clicked the point at longitude:${e.latlng.lng}, latitude:${
                  e.latlng.lat
                } ${JSON.stringify(newRawPoints[feature[2]])}`
              )
              .openOn(map);
          },
          data: newRawPoints.map((r, index) => {
            return [r.geom.coordinates[1], r.geom.coordinates[0], index];
          }),
        });
      }
    }
  }, [map]);

  return (
    <div>
      <Button onClick={handleClickFitToBound}>Fit</Button>
      <pre>{JSON.stringify(clicked.properties)}</pre>
      <MapContainer
        center={position}
        zoom={8}
        scrollWheelZoom={true}
        doubleClickZoom={false}
        preferCanvas={true}
        style={{ height: "900px", width: "100vw" }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};
