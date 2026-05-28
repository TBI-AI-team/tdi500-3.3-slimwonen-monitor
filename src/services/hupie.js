/**
 * HUPIE Datastekker Service
 * TDI500 Trajectlijn 3.1 — SAREF-based SPARQL API
 * 
 * Haalt live warmtepompdata op van Daikin, Triple Solar en Remeha
 * via de TNO HUPIE endpoint met SAREF ontologie.
 */

const ENDPOINT = import.meta.env.VITE_HUPIE_ENDPOINT || '';
const TOKEN = import.meta.env.VITE_HUPIE_TOKEN || '';

const SPARQL_ALL_HEATPUMPS = `
PREFIX saref: <https://saref.etsi.org/core/>
PREFIX s4bldg: <https://saref.etsi.org/saref4bldg/>
PREFIX s4ener: <https://saref.etsi.org/saref4ener/>

SELECT ?heatpump ?property ?value ?unit ?timestamp WHERE {
  ?heatpump a s4bldg:HeatPump ;
            saref:makesMeasurement ?measurement .
  ?measurement saref:relatesToProperty ?property ;
              saref:hasValue ?value ;
              saref:isMeasuredIn ?unit ;
              saref:hasTimestamp ?timestamp .
}
ORDER BY ?heatpump ?property DESC(?timestamp)
`;

const SPARQL_SINGLE_PUMP = (id) => `
PREFIX saref: <https://saref.etsi.org/core/>
PREFIX s4bldg: <https://saref.etsi.org/saref4bldg/>

SELECT ?property ?value ?unit ?timestamp WHERE {
  <${id}> saref:makesMeasurement ?measurement .
  ?measurement saref:relatesToProperty ?property ;
              saref:hasValue ?value ;
              saref:isMeasuredIn ?unit ;
              saref:hasTimestamp ?timestamp .
}
ORDER BY ?property DESC(?timestamp)
`;

export async function fetchAllHeatPumps() {
  if (!ENDPOINT || !TOKEN) return { error: 'HUPIE not configured', data: [] };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: SPARQL_ALL_HEATPUMPS,
    });

    if (!res.ok) throw new Error(`HUPIE ${res.status}`);
    const json = await res.json();

    // Transform SPARQL bindings to structured objects
    const pumps = {};
    for (const binding of json.results?.bindings || []) {
      const pumpId = binding.heatpump?.value || 'unknown';
      if (!pumps[pumpId]) pumps[pumpId] = { id: pumpId, measurements: {} };
      
      const prop = binding.property?.value?.split('/').pop() || 'unknown';
      pumps[pumpId].measurements[prop] = {
        value: parseFloat(binding.value?.value) || null,
        unit: binding.unit?.value?.split('/').pop() || '',
        timestamp: binding.timestamp?.value || null,
        source: 'HUPIE',
        confidence: binding.value?.value != null ? 1.0 : 0.5,
      };
    }

    return { error: null, data: Object.values(pumps) };
  } catch (err) {
    return { error: err.message, data: [] };
  }
}

export async function fetchHeatPump(id) {
  if (!ENDPOINT || !TOKEN) return null;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: SPARQL_SINGLE_PUMP(id),
    });

    if (!res.ok) return null;
    const json = await res.json();

    const measurements = {};
    for (const b of json.results?.bindings || []) {
      const prop = b.property?.value?.split('/').pop() || '';
      if (!measurements[prop]) {
        measurements[prop] = {
          value: parseFloat(b.value?.value) || null,
          unit: b.unit?.value?.split('/').pop() || '',
          timestamp: b.timestamp?.value || null,
        };
      }
    }
    return { id, measurements };
  } catch {
    return null;
  }
}

// Mock data for test mode — realistic Daikin Altherma values
export function getMockHeatPumpData() {
  return [
    {
      id: 'heatPump-bdgp0cbmq2t7uke',
      brand: 'Daikin Altherma 3',
      measurements: {
        supplyTemperature: { value: 35.2, unit: '°C', confidence: 1.0 },
        returnTemperature: { value: 29.8, unit: '°C', confidence: 1.0 },
        outdoorTemperature: { value: 8.4, unit: '°C', confidence: 1.0 },
        COP: { value: 3.8, unit: 'ratio', confidence: 1.0 },
        power: { value: 1.85, unit: 'kW', confidence: 1.0 },
        operationMode: { value: 'heating', unit: 'mode', confidence: 1.0 },
        compressorFrequency: { value: 42, unit: 'Hz', confidence: 1.0 },
        errorCode: { value: 0, unit: 'code', confidence: 1.0 },
      },
    },
    {
      id: 'heatPump-xyz789abc',
      brand: 'Remeha Elga Ace',
      measurements: {
        supplyTemperature: { value: 38.1, unit: '°C', confidence: 1.0 },
        returnTemperature: { value: 31.5, unit: '°C', confidence: 1.0 },
        outdoorTemperature: { value: 8.2, unit: '°C', confidence: 1.0 },
        COP: { value: 3.2, unit: 'ratio', confidence: 1.0 },
        power: { value: 2.4, unit: 'kW', confidence: 1.0 },
        operationMode: { value: 'heating', unit: 'mode', confidence: 1.0 },
        compressorFrequency: { value: null, unit: 'Hz', confidence: 0.5 },
        errorCode: { value: 0, unit: 'code', confidence: 1.0 },
      },
    },
  ];
}
