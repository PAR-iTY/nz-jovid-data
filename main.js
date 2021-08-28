// ------------------------------------------------------------------- //

// goal: lazy/async load both map and table
// this is a good mini-test for async modular loading
// good for general perf and also component-based web design
window.addEventListener('DOMContentLoaded', async e => {
  console.log('DOMContentLoaded:', e.timeStamp);

  const locationsURL =
    'https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson';

  const locations = await fetchJSON(locationsURL);

  initTable(locations);
  initMap(locations);
});

// ------------------------------------------------------------------- //

// async does not encapsulate promise --> call using await
const fetchJSON = async url => {
  try {
    const res = await fetch(url);
    return res.json();
  } catch (error) {
    console.error(error);
  }
};

// ------------------------------------------------------------------- //

const initTable = data => {
  // use reduce to new object to do all data transformation in one pass (!)
  const cityData = data.features.reduce((accObj, feature) => {
    // loop over feature properties by key
    Object.keys(feature.properties).forEach(key => {
      // detect missing values
      if (key !== 'Added' && !feature.properties[key]) {
        console.warn(
          'feature has a non-trivial missing value:',
          feature.properties
        );
      }

      // accumulate/count features by city
      // initialise to 0 when accumulator starts
      // use property key to match city
      // and to assign city name as accObj key
      if (key && key === 'City') {
        accObj[feature.properties[key]] =
          (accObj[feature.properties[key]] || 0) + 1;
      }
    });
    return accObj;
  }, {});

  console.log('cityData:', cityData);

  // const nullCity = data.features.filter(feature => !feature.properties.City);
  // console.log('nullCity: ', nullCity);

  // filter data for significant number of locations
  // would be cool to do by time-relevance but hey cbf rn
  // would obviously be good to do in 1-pass reduce, buuuut
  // would then lose advantage of that accObj containing
  // a clean and full reference set of data attributes that
  // i care about in useful formats for chartjs
  const sigCityData = Object.fromEntries(
    Object.entries(cityData)
      .filter(([key, value]) => value >= 5)
      .sort()
  );

  console.log('sigCityData:', sigCityData);

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
        text: 'NZ Covid-19 August 2021: Locations of interest by city'
      }
    },
    scales: {
      // x: {
      //   min: 5 // only hides data, doesnt remove bar-label or shrink size of chart
      // },
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
    destination: Cesium.Cartesian3.fromDegrees(174.641911, -36.949, 15000.0),
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-50.0),
      roll: 0.0
    },
    duration: 3.0
  });
};

// ------------------------------------------------------------------- //
