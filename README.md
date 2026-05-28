# TDI500 SlimWonen Monitor

> Trajectlijn 3.3 — Slim verwarmen/koelen & luchtkwaliteit  
> TBI AI team × Comfort Partners × TNO/GEEV

## Overzicht

Interactieve bewonersmonitor met vier domeinen en een SAREF-gebaseerde bronnenconfiguratie.

| Tab | Karakter | Domein | Bron |
|-----|----------|--------|------|
| 🏠 Verwarmen | Huisje | Stookgedrag, thermostaat, nacht/away | TDI500 3.2 |
| 🐦 Lucht | Kanarie (AirCheq) | CO₂, PM2.5, ventilatie, kookafzuiging | TNO/GEEV WP3 |
| 🛡️ Gezond | Schild | Schimmel, vocht, GTO, ventilatiedefect | Koppen Bouwexperts |
| ⚡ Energie | Bliksem | Zonnepanelen, WP, auto, piekbelasting | TDI500 3.1/3.2 |
| ⚙️ Bronnen | — | SAREF device configuratie | ETSI TS 103 264 |

## Architectuur

```
┌─────────────────────────────────────────────────────┐
│  React Frontend (dit project)                       │
│  ├── Test mode: scenario-simulatie met mock data    │
│  └── Live mode: real-time data van bronnen          │
├─────────────────────────────────────────────────────┤
│  Data Services Layer                                │
│  ├── HUPIE SPARQL API (warmtepomp SAREF data)       │
│  ├── P1/DSMR (slimme meter via mqtt/rest)           │
│  ├── AirTeq AirCheq (CO₂, PM2.5, RV, temp)         │
│  ├── KNMI / OpenWeatherMap (weer)                   │
│  ├── ENTSO-E (energietarieven)                      │
│  └── RIVM (buitenluchtkwaliteit)                    │
├─────────────────────────────────────────────────────┤
│  SAREF Semantic Layer                               │
│  ├── saref:core v3.2.1                              │
│  ├── saref4ener (warmtepomp, zonnepanelen)          │
│  ├── saref4bldg (ventilatie, zonwering)             │
│  ├── saref4envi (luchtkwaliteit)                    │
│  └── JSON-LD context voor linked data export        │
└─────────────────────────────────────────────────────┘
```

## Connectie met TDI500

| Trajectlijn | Wat | Connectie |
|-------------|-----|-----------|
| **3.1** Data governance | Stichting Datastekker, HUPIE SPARQL | Live WP-data via `services/hupie.js` |
| **3.2** Installateursdashboard | Comfort Partners dashboard | Gedeelde SAREF ontologie + device catalog |
| **3.3** Slim verwarmen & lucht | Dit project | Frontend + scenariologica |

## Installatie

```bash
git clone https://github.com/TBI-AI-team/tdi500-slimwonen-monitor.git
cd tdi500-slimwonen-monitor
npm install
npm run dev        # Development met hot reload
npm run build      # Productie build
```

## Modes

### 🧪 Test mode (standaard)
Scenario-simulatie met voorgedefinieerde data. Geen externe verbindingen nodig.
Ideaal voor demos en presentaties.

### 📡 Live mode
Real-time data van geconfigureerde bronnen. Vereist:
- `.env` met API keys (HUPIE token, ENTSO-E key, OWM key)
- Netwerktoegang tot MQTT broker / REST endpoints

Toggle via de ⚙️ knop → schakelaar bovenaan.

## SAREF Bronnen

73 devices in 10 categorieën, gestructureerd volgens ETSI SAREF:
- Klimaatsensoren (per ruimte)
- Luchtkwaliteit (CO₂, PM2.5, VOC, radon, NO₂)  
- Energie meters (P1, submeters per grootverbruiker)
- Opwek & opslag (zonnepanelen, thuisbatterij)
- HVAC (warmtepomp + COP, WTW, afzuigkap, kleppen)
- Actuatoren (thermostaat, zonwering, verlichting)
- Mobiliteit (laadpaal OCPP, auto SoC)
- Externe API's (weer, tarieven, luchtkwaliteit, pollen)

## Technische referenties

- [SAREF Portal](https://saref.etsi.org/)
- [HUPIE Datastekker](https://www.tno.nl/building/data/tdi500/)
- [TNO GEEV Rapport](https://www.binnenklimaattechniek.nl/)
- [PvE Gezonde Woningen 2026](https://www.binnenklimaattechniek.nl/)

## Team

- **Jeroen** — TBI AI team (architectuur, prototype)
- **Jim Commandeur** — Comfort Partners (domeinexpertise, 3.2 dashboard)
- **TNO** — GEEV onderzoek, HUPIE datastekker, SAREF
- **AirTeq** — AirCheq Canairy sensor

## Licentie

TBI Intern — TDI500 consortium
