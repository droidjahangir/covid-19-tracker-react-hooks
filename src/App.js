import React, { useEffect, useState } from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from '@material-ui/core';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import numeral from 'numeral';
import { prettyPrintStat, sortData } from './utils';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';

function App() {
  const [countries, setCountries] = useState(['USA', 'UK', 'INDIA']);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  // https://disease.sh/v3/covid-19/countries
  // countries data came from disease.sh site through API request
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, // United States, United Kingdom
            value: country.countryInfo.iso2, // UK, US, FR
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);

          // we need all these countrys data because we pass these data into our
          // Map component then loop through all countries and draw circle into the map
          setMapCountries(data);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    // "https://disease.sh/v3/covid-19/all"
    // "https://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]

    const url =
      countryCode === 'worldwide'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
        setCountry(countryCode);

        // All of the data...
        // from the country response
        setCountryInfo(data);

        // when user click a country from drop down then we set this
        // county latitude and longitude, then map will sent you in this country location
        // setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        const mapObj =
          countryCode === 'worldwide'
            ? { lat: 34.80746, lng: -40.4796 }
            : { lat: data.countryInfo.lat, lng: data.countryInfo.long };
        setMapCenter(mapObj);

        if (countryCode === 'worldwide') {
          setMapZoom(3);
        } else {
          setMapZoom(4);
        }
      });
  };

  return (
    // css BAM convension
    <div className="app">
      <div className="app__left">
        {/* Header */}
        <div className="app__header">
          <h1>Covid 19 tracker</h1>
          {/* Title + Select input dropdown field */}
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              {/* Loop through all the countries and show a dropdown 
            list of the options. For this we need state */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
              {/* <MenuItem value="worldwide">Worldwide</MenuItem>
            <MenuItem value="worldwide">Option 2</MenuItem>
            <MenuItem value="worldwide">Option 3</MenuItem>
            <MenuItem value="worldwide">Option 4</MenuItem> */}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          {/* InfoBoxs title="Coronavirus cases" */}
          <InfoBox
            isRed
            active={casesType === 'cases'}
            onClick={(e) => setCasesType('cases')}
            title="Coronavirus Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format('0.0a')}
          />

          {/* InfoBoxs title="Coronavirus recovaries" */}
          <InfoBox
            active={casesType === 'recovered'}
            onClick={(e) => setCasesType('recovered')}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format('0.0a')}
          />

          {/* InfoBoxs title="Coronavirus deaths" */}
          <InfoBox
            isRed
            active={casesType === 'deaths'}
            onClick={(e) => setCasesType('deaths')}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format('0.0a')}
          />
        </div>

        {/* Map */}
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            {/* Table */}
            <h3>Live cases by Country</h3>
            <Table countries={tableData} />

            {/* Graph */}
            <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
