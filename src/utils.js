import React from 'react';
import numeral from 'numeral';
import { Circle, Popup } from 'react-leaflet';
import { lightGreen } from '@material-ui/core/colors';

const casesTypeColors = {
  cases: {
    hex: '#CC1034',
    rgb: 'rgb(204,16,52)',
    half_op: 'rgba(204,16,52,0.5)',
    multiplier: 300,
  },
  recovered: {
    hex: '#586b46',
    rgb: 'rgb(125,215,29)',
    // half_op: "rgba(125,215,29,0.5)",
    multiplier: 400,
  },
  deaths: {
    hex: '#C0C0C0',
    // purple
    rgb: 'rgb(128,0,128)',
    half_op: 'rgba(251,68,67,0.5)',
    multiplier: 2000,
  },
};

// if someone send me some data I can sort these data
export const sortData = (data) => {
  let sortedData = [...data];
  sortedData.sort((a, b) => {
    if (a.cases > b.cases) {
      return -1;
    } else {
      return 1;
    }
  });
  return sortedData;
  // or
  // return sortData.sort((a, b) => (a.cases > b.cases ? -1 : 1))
};

// format numeric data
export const prettyPrintStat = (stat) =>
  stat ? `+${numeral(stat).format('0.0a')}` : '+0';

// DRAW circles on the map with interactive tooltop
export const showDataOnMap = (data, casesType) =>
  data.map((country) => (
    <Circle
      center={[country.countryInfo.lat, country.countryInfo.long]}
      fillOpacity={0.4}
      pathOptions={{
        color: casesTypeColors[casesType].rgb,
        fillColor: casesTypeColors[casesType].rgb,
      }}
      radius={
        Math.sqrt(country[casesType]) * casesTypeColors[casesType].multiplier
      }
    >
      <Popup>
        <div className="info-container">
          <div
            className="info-flag"
            style={{ backgroundImage: `url(${country.countryInfo.flag})` }}
          />
          <div className="info-name">{country.country}</div>
          <div className="info-confirmed">
            Cases: {numeral(country.cases).format('0,0')}
          </div>
          <div className="info-recovered">
            Recovered: {numeral(country.recovered).format('0,0')}
          </div>
          <div className="info-deaths">
            Deaths: {numeral(country.deaths).format('0,0')}
          </div>
        </div>
      </Popup>
    </Circle>
  ));
