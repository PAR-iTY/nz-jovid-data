window.addEventListener('DOMContentLoaded', e => {
  // console.log('initialising..');
  init();
});

const init = async () => {
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

  var locations = Cesium.GeoJsonDataSource.load(locationsURL, {
    markerColor: Cesium.Color.YELLOW,
    stroke: Cesium.Color.BLACK,
    fill: Cesium.Color.BLACK,
    strokeWidth: 3,
    markerSymbol: 'C'
  });
  viewer.dataSources.add(locations);

  var jocations = Cesium.GeoJsonDataSource.load(
    './assets/geojson/jocations-of-interest.geojson',
    {
      markerColor: Cesium.Color.INDIGO,
      stroke: Cesium.Color.WHITE,
      fill: Cesium.Color.GOLD,
      strokeWidth: 3,
      markerSymbol: 'J'
    }
  );
  viewer.dataSources.add(jocations);

  viewer.zoomTo(jocations);
};

// ------------------------------------------------------------------- //

// viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(
//   '2020-09-01T16:23:19.06128571429871954Z'
// );

// viewer.camera.flyTo({
//   destination: Cesium.Cartesian3.fromDegrees(174.7, -36.8, 1000),
//   // new Cesium.Cartesian3(
//   //   -2710360.373185721,
//   //   -4268331.772567541,
//   //   3875541.0654406464
//   // ),
//   orientation: {
//     direction: new Cesium.Cartesian3(
//       0.17835634433098377,
//       0.8113876602784172,
//       0.5566319063661401
//     ),
//     up: new Cesium.Cartesian3(
//       -0.39107298319485395,
//       -0.46064901978847217,
//       0.7967837864709582
//     )
//   },
//   duration: 0
// });

// attempt to get geojson {l/j}ocations into cesium
// https://cesium.com/learn/cesiumjs/ref-doc/GeoJsonDataSource.html?classFilter=json

// and another
// https://sandcastle.cesium.com/index.html?src=GeoJSON%2520and%2520TopoJSON.html
