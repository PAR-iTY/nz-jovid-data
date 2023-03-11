// ------------------------------------------------------------------- //

import { fetchJSON } from './utils.js';

// ------------------------------------------------------------------- //

window.addEventListener('DOMContentLoaded', async e => {
  console.log(
    `DOMContentLoaded in ${
      Math.round((e.timeStamp + Number.EPSILON * 100) / 100) / 1000
    } seconds`
  );

  // fetch live data (disabled due to data source change)
  // const locationsURL =
  //   'https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson';

  // [dev] purely for local conviencience + testing
  const locationsURL = './assets/geojson/reference-locations.geojson';

  const locations = await fetchJSON(locationsURL);

  initChart(locations);
  initMap(locations);
  // functionalise data congestion and distrobution to chart/map funcs
});

const initChart = data => {
  // use reduce to new object to do data transformation and aggregation in one pass
  const cityData = data.features.reduce((accObj, feature) => {
    // outside the entries loop, can I aggregate data in a different way??

    // here i could look at the entire properties object...
    // const { Added, City, Start, End, Event, Location } = feature.properties;
    // accObj.feature = { Added, City, Start, End, Event, Location };

    // loop over feature properties
    for (const [key, value] of Object.entries(feature.properties)) {
      // detect missing values
      if (!value && key !== 'Added' && key !== 'Updated') {
        console.warn(
          'feature has a non-trivial missing value:',
          feature.properties
        );
      }

      // fork off work to other functions if required because:
      // this is the best place to collect feature props key & value

      // add date data to accumulator object
      // accObj[date] = (accObj[date] || 0) + 1;
      // }

      // accumulate/count features by city
      // initialise to 0 when accumulator starts
      // use property key to match city
      // use value (city name) as accObj key
      if (key === 'City' && value) {
        // add city value to accumulator object
        accObj[value] = (accObj[value] || 0) + 1;
      }
    }
    return accObj;
  }, {});

  // console.log('cityData:', cityData);

  // const nullCity = data.features.filter(feature => !feature.properties.City);
  // console.log('nullCity: ', nullCity);

  // filter data for significant number of locations
  // would be cool to do by time-relevance but hey cbf rn
  // would obviously be good to do in 1-pass reduce, buuuut
  // would then lose advantage of that accObj containing
  // a clean and full reference set of data attributes that
  // i care about in useful formats for chartjs

  // dodgy object sort implementation (unreliable ordering)
  // tried swapping Object.fromEntries() with new Map()
  // but chart.js works with objects only, not maps
  const sigCityData = Object.fromEntries(
    Object.entries(cityData)
      // .filter(([key, value]) => value >= 5)
      .sort(([, a], [, b]) => a - b)
      .reverse()
  );

  // console.log('sigCityData:', sigCityData);

  const chartData = {
    // grouped: true,
    label: 'Locations',
    data: Object.values(sigCityData),
    backgroundColor: [
      'rgba(210, 99, 132, 0.6)',
      'rgba(180, 99, 132, 0.6)',
      'rgba(150, 99, 132, 0.6)'
    ],

    borderColor: [
      'rgba(210, 99, 132, 1)',
      'rgba(180, 99, 132, 1)',
      'rgba(150, 99, 132, 1)'
    ],

    borderWidth: 2,
    hoverBorderWidth: 0
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    legend: {
      display: false
    },
    plugins: {
      title: {
        display: true,
        text: 'NZ Covid-19 locations of interest by city/town'
      }
    },
    scales: {
      yAxes: [
        {
          beginAtZero: true
          // barPercentage: 0.5
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
      labels: Object.keys(sigCityData),
      datasets: [chartData]
    },
    options: chartOptions
  });
};

// ------------------------------------------------------------------- //

// Cesium CDN provides immediate access to a Cesium global
const initMap = async data => {
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDlkMzEwYi1mZjFiLTRmYzctOWQ4ZS05ZjM0MGIxNzZiMTQiLCJpZCI6NjQ4MzEsImlhdCI6MTYyOTYyMzQ5Mn0.xoj4jK-_X1HohjWg8rCYH9WPlYqoZJc7lkFKn9rtaXw';

  const viewer = new Cesium.Viewer('cesiumContainer', {
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    allowDataSourcesToSuspendAnimation: true,
    timeline: false,
    animation: false,
    shadows: true,
    baseLayerPicker: false,
    sceneModePicker: false,
    terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: Cesium.createWorldImagery()
  });

  // for debug only
  viewer.scene.debugShowFramesPerSecond = true;

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
  viewer.dataSources.add(locations);

  viewer.camera.flyTo({
    // nz overview cartesian3
    destination: {
      x: -4698915.996064182,
      y: 729761.6783985238,
      z: -4854454.356029411
    },

    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-50.0),
      roll: 0.0
    },
    duration: 3.0
  });

  // [dev] way to surface current POV positions to update flyTo
  // setInterval(() => {
  //   console.dir(viewer.scene.camera.position);
  // }, 3000);

  // Cesium.Cartesian3.fromDegrees(174.641911, -36.949, 15000.0),

  // add cartesian to flyTo directly
  // x: -5090447.751044754;
  // y: 450921.7119908405;
  // z: -3806530.1980104563;
};

// ------------------------------------------------------------------- //
