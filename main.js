// ------------------------------------------------------------------- //

/*
 * todo:
 *  - improve reduce accObj so it collects more information per city
 *  - seperate data-cleaning functionality from chart functionality
 *  - and/or develop a new data structure e.g. for time-series line chart
 *  - babel this script for compatability - improve async/lazyness
 *  - improve UX - site title/heading, explain covid-chart & jovid-map
 */

// ------------------------------------------------------------------- //

// goal: lazy/async load both map and table
// this is a good mini-test for async modular loading
// good for general perf and also component-based web design
window.addEventListener('DOMContentLoaded', async e => {
  // console.log('DOMContentLoaded:', Math.(e.timeStamp / 1000));
  console.log(
    `DOMContentLoaded in ${
      Math.round((e.timeStamp + Number.EPSILON * 100) / 100) / 1000
    } seconds`
  );

  const locationsURL =
    'https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson';

  const locations = await fetchJSON(locationsURL);

  initChart(locations);
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

const getDate = value => {
  // convert to MM/DD/YYYY format for new Date(input)
  const dateStr = `${value[3]}${value[4]}/${value[0]}${
    value[1]
  }/${value.substring(6, 10)}`;

  // console.log('dateStr:', dateStr);
  return new Date(dateStr);
  // console.log(dateObj.toLocaleDateString());

  // prettify date for display to users
  // const date = value.substring(0, 10);
  // const time = value.substring(12);
  // console.log('date: ', date);
  // console.log('time: ', time);
  // return [date, time];
};

// what else to do with the data...
// i could create a sequence starting from the first recorded location to the last!

const initChart = data => {
  const seqData = data.features
    .map(feature => {
      const { Start, End, id } = feature.properties;
      // console.log('start:', getDate(Start));
      const x = { Start, End, id };
      return x;
    })
    .sort((a, b) => getDate(a.Start) - getDate(b.Start));

  // ^ needs to be more complex to link the trail of locations
  // must detect: first starting location's end time
  //              next starting location's start time

  // so this needs to do a look-ahead?

  // i can make a crude assumption: it matters less what the end time is
  // because the data shows when (someone) was at a location, and i will
  // show the relationship between that contagious event and the next.

  // because this data does not identify citizens (thank Wanye @ Stats)
  // i should not pretend that the sequence is linear.
  // every start time event should be linked with a line to every soon
  // after event (give a param of 3 hours [or a day, depends on data])

  // strongest lines should be ranked by a few criteria:
  // how close geographically they are
  // how closely in start times they are
  // how close the firsts end time is to the nexts start time

  console.log('seqData: ', seqData);

  // use reduce to new object to do data transformation and aggregation in one pass
  const cityData = data.features.reduce((accObj, feature) => {
    // outside the entries loop, can I aggregate data in a different way??

    // here i could look at the entire properties object...
    // const { Added, City, Start, End, Event, Location } = feature.properties;
    // accObj.feature = { Added, City, Start, End, Event, Location };

    // loop over feature properties
    for (const [key, value] of Object.entries(feature.properties)) {
      // detect missing values
      if (key !== 'Added' && !value) {
        console.warn(
          'feature has a non-trivial missing value:',
          feature.properties
        );
      }

      // [rest of code moved to getDate]
      // add date data to accumulator object
      // accObj[date] = (accObj[date] || 0) + 1;
      // }

      // accumulate/count features by city
      // initialise to 0 when accumulator starts
      // use property key to match city
      // use value (city name) as accObj key
      if (key && key === 'City') {
        // add city value to accumulator object
        accObj[value] = (accObj[value] || 0) + 1;
      }
    }
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
