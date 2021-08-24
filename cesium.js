window.addEventListener('DOMContentLoaded', e => {
  // console.log('initialising..');
  init();
});

const init = () => {
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDlkMzEwYi1mZjFiLTRmYzctOWQ4ZS05ZjM0MGIxNzZiMTQiLCJpZCI6NjQ4MzEsImlhdCI6MTYyOTYyMzQ5Mn0.xoj4jK-_X1HohjWg8rCYH9WPlYqoZJc7lkFKn9rtaXw';

  const viewer = new Cesium.Viewer('cesiumContainer', {
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    timeline: false,
    animation: false,
    baseLayerPicker: false,
    sceneModePicker: false,
    terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: Cesium.createWorldImagery()
  });
  viewer.scene.primitives.add(Cesium.createOsmBuildings());

  viewer.scene.globe.depthTestAgainstTerrain = true;

  const locationsURL =
    'https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson';

  const locations = Cesium.GeoJsonDataSource.load(locationsURL, {
    clampToGround: true,
    markerColor: Cesium.Color.YELLOW,
    stroke: Cesium.Color.BLACK,
    fill: Cesium.Color.BLACK,
    strokeWidth: 3,
    markerSymbol: 'C' // ☢
  });
  viewer.dataSources.add(locations);

  const jocations = Cesium.GeoJsonDataSource.load(
    './assets/geojson/jocations-of-interest.geojson',
    {
      clampToGround: true,
      markerColor: Cesium.Color.INDIGO,
      stroke: Cesium.Color.WHITE,
      fill: Cesium.Color.GOLD,
      strokeWidth: 3,
      markerSymbol: 'J'
    }
  );
  viewer.dataSources.add(jocations);

  // viewer.zoomTo(jocations);

  // generic akl coordinates:
  // -36.879044, 174.748075

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(174.641911, -36.949, 4000.0),
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-30.0),
      roll: 0.0
    },
    duration: 3.0
  });
};

// ------------------------------------------------------------------- //

// viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(
//   '2020-09-01T16:23:19.06128571429871954Z'
// );

// attempt to get geojson {l/j}ocations into cesium
// https://cesium.com/learn/cesiumjs/ref-doc/GeoJsonDataSource.html?classFilter=json

// and another
// https://sandcastle.cesium.com/index.html?src=GeoJSON%2520and%2520TopoJSON.html
