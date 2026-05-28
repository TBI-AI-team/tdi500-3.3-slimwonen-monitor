/**
 * Data Service Layer
 * Switches between TEST mode (mock scenarios) and LIVE mode (real API data)
 * All data normalized to SAREF properties
 */

import { fetchAllHeatPumps, getMockHeatPumpData } from './hupie.js';

const MODE = import.meta.env.VITE_MODE || 'test';

// ─── Mock sensor data for test mode ───
const MOCK_SENSORS = {
  temp_indoor: 20.5,
  temp_outdoor: 14.0,
  temp_wall: 16.2,
  co2: 596,
  pm25_indoor: 2,
  pm25_outdoor: 8,
  rh_indoor: 54,
  rh_bathroom: 52,
  rh_bedroom: 58,
  voc: 120,
  noise_db: 28,
  occupancy: true,
  power_total: 1850,
  power_solar: 3200,
  power_ev: 0,
  power_wp: 1200,
  gas_today: 0.8,
  water_today: 95,
  solar_today: 18.4,
  energy_price: 0.28,
  grid_co2: 380,
};

// ─── Live data fetchers ───
async function fetchP1Data() {
  // P1/DSMR smart meter via local REST bridge
  try {
    const res = await fetch('/api/p1');
    return await res.json();
  } catch { return null; }
}

async function fetchAirTeqData() {
  // AirTeq AirCheq sensor
  const sensorId = import.meta.env.VITE_AIRTEQ_SENSOR_ID;
  try {
    const res = await fetch(`/api/airteq/${sensorId}`);
    return await res.json();
  } catch { return null; }
}

async function fetchWeatherData() {
  const key = import.meta.env.VITE_OWM_API_KEY;
  const lat = import.meta.env.VITE_OWM_LAT || '52.09';
  const lon = import.meta.env.VITE_OWM_LON || '5.12';
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
    );
    return await res.json();
  } catch { return null; }
}

async function fetchEnergyPrice() {
  const token = import.meta.env.VITE_ENTSOE_TOKEN;
  if (!token) return null;
  // Simplified — real implementation would parse ENTSO-E XML
  return { price: 0.28, unit: '€/kWh', source: 'ENTSO-E' };
}

async function fetchRIVMAqi() {
  const station = import.meta.env.VITE_RIVM_STATION || 'NL49017';
  try {
    const res = await fetch(`https://api.luchtmeetnet.nl/open_api/stations/${station}/measurements?page=1&per_page=1`);
    return await res.json();
  } catch { return null; }
}

// ─── Main export ───
export async function getData(mode = MODE) {
  if (mode === 'test') {
    return {
      mode: 'test',
      timestamp: new Date().toISOString(),
      sensors: { ...MOCK_SENSORS },
      heatpumps: getMockHeatPumpData(),
      weather: { temp: 14, rh: 68, wind: 12, description: 'bewolkt' },
      energy: { price: 0.28, gridCO2: 380 },
    };
  }

  // Live mode — parallel fetch all sources
  const [hupie, p1, airteq, weather, price, aqi] = await Promise.allSettled([
    fetchAllHeatPumps(),
    fetchP1Data(),
    fetchAirTeqData(),
    fetchWeatherData(),
    fetchEnergyPrice(),
    fetchRIVMAqi(),
  ]);

  return {
    mode: 'live',
    timestamp: new Date().toISOString(),
    sensors: {
      temp_indoor: airteq.value?.temperature ?? null,
      temp_outdoor: weather.value?.main?.temp ?? null,
      co2: airteq.value?.co2 ?? null,
      pm25_indoor: airteq.value?.pm25 ?? null,
      pm25_outdoor: aqi.value?.data?.[0]?.value ?? null,
      rh_indoor: airteq.value?.humidity ?? null,
      power_total: p1.value?.power_total ?? null,
      power_solar: p1.value?.power_solar ?? null,
    },
    heatpumps: hupie.value?.data || [],
    weather: weather.value?.main ? {
      temp: weather.value.main.temp,
      rh: weather.value.main.humidity,
      wind: weather.value.wind?.speed,
      description: weather.value.weather?.[0]?.description,
    } : null,
    energy: {
      price: price.value?.price ?? null,
      gridCO2: null,
    },
    errors: [hupie, p1, airteq, weather, price, aqi]
      .filter(r => r.status === 'rejected')
      .map(r => r.reason?.message),
  };
}
