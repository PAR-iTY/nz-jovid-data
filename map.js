window.addEventListener('DOMContentLoaded', event => {
  // console.log('initialising..');
  init();
});

const init = async () => {
  let osmb = new OSMBuildings({
    container: 'map',
    position: {
      latitude: -36.85436,
      longitude: 174.75717
    },
    zoom: 17,
    minZoom: 1,
    maxZoom: 5000,
    tilt: 600,
    rotation: 0,
    effects: ['shadows'],
    attribution:
      'Â© Map & Geo Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> Â© 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
  });

  osmb.on('loadfeature', e => {
    console.log('loadfeature', e);
  });

  // from: https://osmbuildings.org/js/map.js
  osmb.addMapTiles('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png');

  // tell osmb to display all OpenStreetMap buildings
  osmb.addGeoJSONTiles(
    'http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json'
  );

  // osmb.addGeoJSONTiles(
  //   'https://{s}.data.osmbuildings.org/0.2/ph2apjye/tile/{z}/{x}/{y}.json'
  // );

  // get minhealth covid locations
  const locations = await fetchJSON('./geojson/locations-of-interest.geojson');
  // console.log('locations: ', locations);

  // get jocations
  const jocations = await fetchJSON('./geojson/jocations-of-interest.geojson');
  // console.log('jocations: ', jocations);

  // add geojson features
  // osmb.addGeoJSON(locations);
  // osmb.addGeoJSON(jocations);

  for (l of locations.features) {
    // console.log(l);
    osmb.addMarker(
      {
        latitude: l.geometry.coordinates[1],
        longitude: l.geometry.coordinates[0],
        altitude: 20
      },
      { id: l.properties.id, name: l.properties.event },
      { color: '#ff0000' }
    );
    osmb.addOBJ(
      `${location.href}skull/skull.obj`,
      {
        // latitude: -36.85436,
        // longitude: 174.75717
        latitude: l.geometry.coordinates[1],
        longitude: l.geometry.coordinates[0]
      },
      {
        id: 1,
        scale: 20000,
        altitude: 30,
        rotation: 0
        // color: '#f26722'
      }
    );
  }

  // const skull = await fetchObj('skull/skull.obj');
  // console.log('skull: ', skull);
  console.log(`${location.href}skull/skull.obj`);
  // console.log(
  //   `${location.protocol}//${location.hostname}/${location.pathname}/some.obj`
  // );

  // for (j of jocations.features) {
  // }

  // let rotation = 0;
  // rotate(osmb, rotation);
};

// call using await
const fetchJSON = url =>
  fetch(url)
    .then(res => res.json())
    .then(json => json);

// const fetchObj = url =>
//   fetch(url)
//     .then(res => res.text())
//     .then(text => text);
//     // .then(blob => URL.createObjectURL(blob));

const rotate = (map, rotation) => {
  // always says 'setRotation is not a function'
  map.setRotation(rotation);
  rotation = (rotation + 1) % 360;
  requestAnimationFrame(rotate);
};

// addMapTiles

// osmb.addMapTiles(
//   'https://api.mapbox.com/styles/v1/osmbuildings/cjt9gq35s09051fo7urho3m0f/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYnVpbGRpbmdzIiwiYSI6IjNldU0tNDAifQ.c5EU_3V8b87xO24tuWil0w'
// );

// osmb.addMapTiles(
//   'https://api.mapbox.com/styles/v1/osmbuildings/cjt9gq35s09051fo7urho3m0f/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYnVpbGRpbmdzIiwiYSI6IjNldU0tNDAifQ.c5EU_3V8b87xO24tuWil0w',
//   {
//     attribution:
//       '© Data <a href="http://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
//   }
// );

// addGeoJSONTiles

// osmb.addGeoJSONTiles(
//   'https://{s}.data.osmbuildings.org/0.2/ph2apjye/tile/{z}/{x}/{y}.json',
//   {
//     fixedZoom: 15
//   }
// );
