// ------------------------------------------------------------------- //

// goal: lazy/async load both map and table
// this is a good mini-test for async modular loading
// good for general perf and also component-based web design
window.addEventListener('DOMContentLoaded', async e => {
  const locationsURL =
    'https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson';

  const locations = await fetchJSON(locationsURL);

  initTable(locations);
  // initMap(locations);
});

// ------------------------------------------------------------------- //

const initTable = data => {
  // use reduce to do all data transformation in one pass (!)
  const cityData = data.features.reduce((accObj, feature) => {
    Object.keys(feature.properties).forEach(key => {
      if (key && key === 'City') {
        accObj[feature.properties[key]] =
          (accObj[feature.properties[key]] || 0) + 1;
      }
    });
    return accObj;
  }, {});

  console.log('cityData: ', cityData);

  const chartData = {
    // grouped: true,
    label: 'Locations',
    data: Object.values(cityData),
    backgroundColor: 'rgba(180, 99, 132, 0.6)',

    borderColor: 'rgba(180, 99, 132, 1)',

    borderWidth: 2,
    hoverBorderWidth: 0
  };

  const chartOptions = {
    responsive: true,
    indexAxis: 'y',
    legend: {
      display: false
    },
    plugins: {
      title: {
        display: true,
        text: 'NZ Covid-19 Augest 2021 Locations of interest by city'
      }
    },
    scales: {
      x: {
        min: 5
      },
      yAxes: [
        {
          // beginAtZero: true,
          barPercentage: 0.5
        }
      ]
    },
    elements: {
      rectangle: {
        borderSkipped: 'left'
      }
    }
  };

  const ctx = document.getElementById('chart').getContext('2d');

  const myChart = new Chart(ctx, {
    type: 'bar',
    // grouped: true,
    data: {
      labels: Object.keys(cityData),
      datasets: [chartData]
    },
    options: chartOptions
  });
};

// ------------------------------------------------------------------- //

const initMap = data => {
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

  // load input data from function param
  const locations = Cesium.GeoJsonDataSource.load(data, {
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

// call using await
const fetchJSON = url =>
  fetch(url)
    .then(res => res.json())
    .then(json => json)
    .catch(error => console.error(error));

// ------------------------------------------------------------------- //
