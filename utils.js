// ------------------------------------------------------------------- //

// expects a string input value in NZ 12 hour format
// known format (for now) but could parameterise
// return moment object for versatility

// const getDate = value => {
// convert to MM/DD/YYYY format for new Date(input)
//   let m = moment(value, 'D-M-YYYY, h:mm a');
//   return m;
// };

// update: this gets tripped up by M vs MM month values with leading 0's
// verify input formatting is valid
// ie: january rendered as  /01/ vs. /1/ etc
// if (m.format('D/M/YYYY, h:mm a') !== value) {
//   console.warn(
//     '[moment.js date formatting error]:\n',
//     value,
//     '\n',
//     m.format('D/M/YYYY, h:mm a')
//   );
// }

// ------------------------------------------------------------------- //

// async does not encapsulate promise --> call using await
// does awaiting res.methods() do anything? is there any way to fully
// encapsulate async within fetch functions
// (i.e. not have to await the fetch function call in parent scope too)
const fetchJSON = async url => {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json;
  } catch (error) {
    console.error(error);
  }
};

// ------------------------------------------------------------------- //

const fetchCSV = async url => {
  try {
    const res = await fetch(url, {
      headers: {
        'content-type': 'text/csv;charset=UTF-8'
      }
    });
    const text = await res.text();
    return text;
  } catch (error) {
    console.error(error);
  }
};

// ------------------------------------------------------------------- //

// uses bitwise operation to determine if int is odd or not
const isOdd = n =>
  n && n === parseInt(n, 10)
    ? n & 1
      ? true
      : false
    : Error('input value must be a non-zero integer');

// ------------------------------------------------------------------- //

const diff = (a, b) => (a > b ? a - b : b - a);

// ------------------------------------------------------------------- //

// generic attribute-dropper for array of objects (API, JSON-type data)
// challenge: how to predict number of dropped attributes (args/.length?)
// and how to replicate that into the map params...
const dropAttrs = objArray =>
  objArray.map(({ dropAttr1, dropAttr2, ...keepAttrs }) => keepAttrs);

// ------------------------------------------------------------------- //

export { fetchJSON };

// ------------------------------------------------------------------- //
