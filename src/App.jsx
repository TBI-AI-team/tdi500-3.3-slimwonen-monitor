import { useState, useEffect } from "react";

// Theme tokens
const T={light:{bg:"#FAFAF8",surface:"#FFFFFF",surfaceAlt:"#F5F5F0",border:"#E8E6E0",text:"#1D1D1F",textSec:"#6E6E73",textTer:"#AEAEB2",good:"#34C759",warn:"#FF9F0A",bad:"#FF3B30",info:"#007AFF",goodBg:"#E8F8ED",warnBg:"#FFF4E0",badBg:"#FFE8E7",infoBg:"#E5F1FF",goodT:"#0B6623",warnT:"#7A4A00",badT:"#8B1A12",infoT:"#004AAD"},dark:{bg:"#000000",surface:"#1C1C1E",surfaceAlt:"#2C2C2E",border:"#38383A",text:"#F5F5F7",textSec:"#98989D",textTer:"#636366",good:"#30D158",warn:"#FFD60A",bad:"#FF453A",info:"#0A84FF",goodBg:"#0B2E14",warnBg:"#332B00",badBg:"#3A100E",infoBg:"#001A3D",goodT:"#5AE27A",warnT:"#FFD60A",badT:"#FF6B61",infoT:"#5AC8FA"}};

// Scenarios
const HOUSE=[
  {id:"h1",label:"Efficiënt verwarmd",icon:"🌿",status:"good",m:[{l:"Binnen",v:"20.5°C"},{l:"Buiten",v:"14°C"},{l:"Verbruik",v:"2.1 kWh"},{l:"Besparing",v:"+18%"}],ring:{v:92,label:"Comfort"},sigs:[{t:"Nachtstand actief",g:1},{t:"Passieve zonwarmte benut",g:1},{t:"Ramen dicht bij verwarmen",g:1}],tip:"Mooi! Efficiënt verwarmd met passieve warmte.",char:"happy",accent:"#34C759"},
  {id:"h2",label:"Te warm gestookt",icon:"🔥",status:"warn",m:[{l:"Binnen",v:"23.8°C"},{l:"Buiten",v:"3°C"},{l:"Verbruik",v:"7.9 kWh"},{l:"Besparing",v:"-14%"}],ring:{v:52,label:"Comfort"},sigs:[{t:"Thermostaat op 24°C",g:0},{t:"Geen nachtstand ingesteld",g:0},{t:"Tip: 1°C lager = 7% besparing",g:1}],tip:"40% van bewoners zet de thermostaat op 21°C. Elke graad lager scheelt ~7%.",char:"hot",accent:"#FF9F0A"},
  {id:"h3",label:"Niet thuis — kachel brandt",icon:"🚪",status:"bad",m:[{l:"Binnen",v:"21.8°C"},{l:"Buiten",v:"8°C"},{l:"Verbruik",v:"5.2 kWh"},{l:"Besparing",v:"-22%"}],ring:{v:30,label:"Comfort"},sigs:[{t:"Niemand thuis gedetecteerd",g:0},{t:"Verwarming draait nog",g:0},{t:"Tip: stel away-modus in",g:1}],tip:"Niemand thuis maar de kachel brandt. Een away-stand bespaart tot 15%.",char:"sleeping",accent:"#636366"},
  {id:"h4",label:"Koeling zomer — zonwering open",icon:"☀️",status:"warn",m:[{l:"Binnen",v:"25.4°C"},{l:"Buiten",v:"31°C"},{l:"Verbruik",v:"4.5 kWh"},{l:"Koeling",v:"Actief"}],ring:{v:58,label:"Comfort"},sigs:[{t:"Zonwering niet gesloten",g:0},{t:"Airco werkt overdag hard",g:0},{t:"Tip: ventileer 's nachts",g:1}],tip:"Zonwering overdag sluiten is de meest effectieve maatregel.",char:"cool",accent:"#007AFF"},
];
const CANARY=[
  {id:"c1",label:"Goede luchtkwaliteit",icon:"🌬️",status:"good",m:[{l:"CO₂",v:"596 ppm"},{l:"PM2.5",v:"2 µg/m³"},{l:"RV",v:"54%"},{l:"Temp",v:"20.3°C"}],ring:{v:22,label:"AQI"},sigs:[{t:"CO₂ normaal",g:1},{t:"Fijnstof ver onder WHO-norm",g:1},{t:"Luchtvochtigheid in balans",g:1}],tip:"Alles in orde. De Canairy zingt.",canary:"happy"},
  {id:"c2",label:"Na het koken — fijnstof",icon:"🍳",status:"warn",m:[{l:"CO₂",v:"1152 ppm"},{l:"PM2.5",v:"33 µg/m³"},{l:"RV",v:"68%"},{l:"Temp",v:"22.1°C"}],ring:{v:67,label:"AQI"},sigs:[{t:"PM2.5 boven WHO-norm",g:0},{t:"Tip: afzuigkap vóór bakken",g:1},{t:"Bak op achterste pitten",g:1}],tip:"TNO-lab: hoekplaatsing vangt met 165 m³/uur 85% kookdampen. Schakel kap in vóór je begint.",canary:"warn"},
  {id:"c3",label:"Benauwd — CO₂ hoog",icon:"😤",status:"bad",m:[{l:"CO₂",v:"2135 ppm"},{l:"PM2.5",v:"4 µg/m³"},{l:"RV",v:"62%"},{l:"Temp",v:"21°C"}],ring:{v:85,label:"AQI"},sigs:[{t:"CO₂ ver boven 1000 ppm",g:0},{t:"Ventilatie op laagstand",g:0},{t:"Tip: open raam of zet stand hoger",g:1}],tip:"Boven 1200 ppm daalt concentratie meetbaar. Ventileer!",canary:"sick"},
  {id:"c4",label:"Buitenlucht slechter dan binnen",icon:"🏭",status:"info",m:[{l:"CO₂",v:"680 ppm"},{l:"PM2.5 in",v:"12 µg/m³"},{l:"PM2.5 uit",v:"38 µg/m³"},{l:"Temp",v:"20°C"}],ring:{v:40,label:"AQI"},sigs:[{t:"Buitenlucht: PM2.5 hoog",g:0},{t:"Ramen dicht houden!",g:1},{t:"F7-filter vangt 55% fijnstof",g:1}],tip:"3-4 dagen per jaar is buitenlucht zo slecht. Houd ramen dicht.",canary:"outdoor"},
  {id:"c5",label:"Slaapkamer — nacht",icon:"🌙",status:"warn",m:[{l:"CO₂",v:"980 ppm"},{l:"PM2.5",v:"3 µg/m³"},{l:"RV",v:"62%"},{l:"Temp",v:"18.5°C"}],ring:{v:45,label:"AQI"},sigs:[{t:"CO₂ loopt op door slapers",g:0},{t:"Raam op kier helpt enorm",g:1},{t:"Slaapkwaliteit beter < 800 ppm",g:1}],tip:"In 2 van 3 Hilversum-woningen daalde CO₂ meetbaar na plaatsing Canairy.",canary:"night"},
];
const HEALTH=[
  {id:"w1",label:"Schimmelrisico slaapkamer",icon:"🍄",status:"bad",m:[{l:"RV slaapk.",v:"78%"},{l:"Temp wand",v:"13.2°C"},{l:"Dauwpunt",v:"15.8°C"},{l:"Risico",v:"Hoog"}],ring:{v:82,label:"Risico"},sigs:[{t:"RV boven 70%",g:0},{t:"Ventilatie op laagstand",g:0},{t:"Overstroomopening < 15mm",g:0}],tip:"Koppen Bouwexperts: 48 van 59 woningen met vochtplekken. #1 oorzaak: onjuist ventilatie-gebruik.",shield:"danger"},
  {id:"w2",label:"Vocht badkamer",icon:"🚿",status:"warn",m:[{l:"RV badkamer",v:"88%"},{l:"Droogtijd",v:"> 2 uur"},{l:"Ventilatie",v:"Laagstand"},{l:"Afzuig",v:"38 m³/u"}],ring:{v:65,label:"Risico"},sigs:[{t:"Badkamer droogt te langzaam",g:0},{t:"Tip: schakel hoogstand bij douchen",g:1},{t:"PvE eis: < 70% RV binnen 2 uur",g:1}],tip:"Brink-systeem haalt 71 min — maar alleen met ventilatie in hoogstand.",shield:"moisture"},
  {id:"w3",label:"Oververhitting 26.5°C+",icon:"🌡️",status:"bad",m:[{l:"Binnen",v:"27.2°C"},{l:"Buiten",v:"33°C"},{l:"GTO",v:"Overschreden"},{l:"Uren >26°C",v:"142"}],ring:{v:78,label:"Risico"},sigs:[{t:"Binnentemp boven 26.5°C",g:0},{t:"Zonwering niet gesloten",g:0},{t:"Risico voor kwetsbaren",g:0}],tip:"Boven 26.5°C gezondheidsrisico — vooral ouderen. Zonwering overdag, ventileer 's nachts.",shield:"heat"},
  {id:"w4",label:"Ventilatie werkt niet goed",icon:"⚠️",status:"warn",m:[{l:"Afzuig keuken",v:"38 m³/u"},{l:"BBL eis",v:"75 m³/u"},{l:"CO₂ trend",v:"Stijgend"},{l:"Klachten",v:"Benauwd"}],ring:{v:55,label:"Risico"},sigs:[{t:"Afzuigcapaciteit onder BBL-eis",g:0},{t:"Filters mogelijk vervuild",g:0},{t:"Tip: laat installatie checken",g:1}],tip:"Geen systeem in Koppen-inspecties voldeed in laagstand. In hoogstand slechts de helft.",shield:"system"},
  {id:"w5",label:"Alles gezond",icon:"✅",status:"good",m:[{l:"RV",v:"52%"},{l:"Temp",v:"20.5°C"},{l:"Schimmel",v:"Geen risico"},{l:"GTO",v:"OK"}],ring:{v:12,label:"Risico"},sigs:[{t:"Luchtvochtigheid in balans",g:1},{t:"Geen condensatie op wanden",g:1},{t:"Temperatuur comfortabel",g:1}],tip:"De woning is gezond. Alle parameters binnen de normen.",shield:"ok"},
];
const ENERGY=[
  {id:"e1",label:"Zonnepanelen — goede dag",icon:"☀️",status:"good",m:[{l:"Opwek",v:"28.4 kWh"},{l:"Verbruik",v:"12.1 kWh"},{l:"Teruglev.",v:"16.3 kWh"},{l:"Zelfgebr.",v:"43%"}],ring:{v:88,label:"Score"},sigs:[{t:"Panelen leveren meer dan verbruik",g:1},{t:"Grootverbruikers overdag",g:1},{t:"Tip: laad auto overdag",g:1}],tip:"Topdag! Verschuif grootverbruikers naar zonne-uren.",bolt:"solar"},
  {id:"e2",label:"Warmtepomp — hoog verbruik",icon:"🌡️",status:"warn",m:[{l:"WP verbruik",v:"8.2 kWh"},{l:"COP",v:"2.8"},{l:"Buiten",v:"-2°C"},{l:"Buffer",v:"42°C"}],ring:{v:55,label:"Score"},sigs:[{t:"COP laag door koude",g:0},{t:"Bijverwarming actief",g:0},{t:"Tip: buffer voorladen overdag",g:1}],tip:"Onder 0°C daalt de COP. Laad buffer overdag. Vermijd bijverwarming.",bolt:"heatpump"},
  {id:"e3",label:"Piekverbruik — meerdere apparaten",icon:"⚡",status:"bad",m:[{l:"Huidig",v:"6.8 kW"},{l:"Piek limiet",v:"5.0 kW"},{l:"Auto laden",v:"3.7 kW"},{l:"WP",v:"2.1 kW"}],ring:{v:136,label:"% piek"},sigs:[{t:"Gelijktijdig laden + WP",g:0},{t:"Boven aansluitcapaciteit",g:0},{t:"Tip: spreiding via schema",g:1}],tip:"Auto laden + WP + koken tegelijk overschrijdt je aansluitwaarde.",bolt:"peak"},
  {id:"e4",label:"Auto laden — slim gepland",icon:"🚗",status:"good",m:[{l:"Laadsnelh.",v:"7.4 kW"},{l:"Zonne-str.",v:"5.1 kW"},{l:"SoC auto",v:"62%"},{l:"Klaar om",v:"07:00"}],ring:{v:82,label:"Score"},sigs:[{t:"Laden met eigen zonnestroom",g:1},{t:"Dalurenprofiel actief",g:1},{t:"Vertrek gepland: 07:00",g:1}],tip:"Slim laden: overdag op zon, 's nachts op daluren.",bolt:"ev"},
  {id:"e5",label:"Energiebalans — maand",icon:"📊",status:"info",m:[{l:"Opwek mnd",v:"310 kWh"},{l:"Verbruik",v:"420 kWh"},{l:"Netto",v:"-110 kWh"},{l:"Kosten",v:"€ 38"}],ring:{v:74,label:"%"},sigs:[{t:"74% zelfvoorzienend",g:1},{t:"Grootverbruikers: WP 45%, auto 28%",g:0},{t:"Tip: verschuif naar zon-uren",g:1}],tip:"Je dekt 74%. WP en auto zijn grootverbruikers. Slim plannen → 85%.",bolt:"balance"},
];

// SAREF Device Catalog (73 devices, 10 categories)
const SAREF_CATALOG=[
  {cat:"Klimaat",icon:"🌡️",desc:"Temperatuur, vocht, druk",items:[
    {id:"temp_in_wk",name:"Temp. woonkamer",saref:"saref:TemperatureSensor",prop:"saref:Temperature",unit:"°C",tab:["house","health"],protocol:"Zigbee"},
    {id:"temp_in_sk",name:"Temp. slaapkamer",saref:"saref:TemperatureSensor",prop:"saref:Temperature",unit:"°C",tab:["house","health"],protocol:"Zigbee"},
    {id:"temp_in_bk",name:"Temp. badkamer",saref:"saref:TemperatureSensor",prop:"saref:Temperature",unit:"°C",tab:["health"],protocol:"Zigbee"},
    {id:"temp_out",name:"Temp. buiten",saref:"saref:TemperatureSensor",prop:"saref:Temperature",unit:"°C",tab:["house","energy"],protocol:"LoRa"},
    {id:"temp_wall",name:"Wandtemp. (dauwpunt)",saref:"saref:TemperatureSensor",prop:"saref:Temperature",unit:"°C",tab:["health"],protocol:"Zigbee"},
    {id:"rh_wk",name:"RV woonkamer",saref:"saref:Sensor",prop:"saref:Humidity",unit:"%RH",tab:["canary","health"],protocol:"Zigbee"},
    {id:"rh_sk",name:"RV slaapkamer",saref:"saref:Sensor",prop:"saref:Humidity",unit:"%RH",tab:["health"],protocol:"Zigbee"},
    {id:"rh_bath",name:"RV badkamer",saref:"saref:Sensor",prop:"saref:Humidity",unit:"%RH",tab:["health"],protocol:"Zigbee"},
    {id:"rh_out",name:"RV buiten",saref:"saref:Sensor",prop:"saref:Humidity",unit:"%RH",tab:["canary"],protocol:"LoRa"},
    {id:"pressure",name:"Luchtdruk",saref:"saref:Sensor",prop:"saref:Pressure",unit:"hPa",tab:["canary"],protocol:"I²C"},
  ]},
  {cat:"Luchtkwaliteit",icon:"💨",desc:"CO₂, fijnstof, VOC, radon",items:[
    {id:"co2_wk",name:"CO₂ woonkamer",saref:"saref:Sensor",prop:"saref:CO2",unit:"ppm",tab:["canary"],protocol:"WiFi"},
    {id:"co2_sk",name:"CO₂ slaapkamer",saref:"saref:Sensor",prop:"saref:CO2",unit:"ppm",tab:["canary","health"],protocol:"WiFi"},
    {id:"pm25_in",name:"PM2.5 binnen",saref:"saref:Sensor",prop:"s4envi:PM",unit:"µg/m³",tab:["canary","health"],protocol:"WiFi"},
    {id:"pm10_in",name:"PM10 binnen",saref:"saref:Sensor",prop:"s4envi:PM",unit:"µg/m³",tab:["canary"],protocol:"WiFi"},
    {id:"pm25_out",name:"PM2.5 buiten (RIVM)",saref:"saref:Sensor",prop:"s4envi:PM",unit:"µg/m³",tab:["canary"],protocol:"REST API"},
    {id:"voc",name:"VOC (vluchtige stoffen)",saref:"saref:Sensor",prop:"s4envi:Chemical",unit:"ppb",tab:["canary","health"],protocol:"I²C"},
    {id:"radon",name:"Radon",saref:"saref:Sensor",prop:"s4envi:Chemical",unit:"Bq/m³",tab:["health"],protocol:"BLE"},
    {id:"no2_in",name:"NO₂ (koken op gas)",saref:"saref:Sensor",prop:"s4envi:Chemical",unit:"µg/m³",tab:["canary","health"],protocol:"I²C"},
    {id:"formaldehyde",name:"Formaldehyde",saref:"saref:Sensor",prop:"s4envi:Chemical",unit:"µg/m³",tab:["health"],protocol:"I²C"},
  ]},
  {cat:"Aanwezigheid & Comfort",icon:"👤",desc:"Beweging, geluid, licht",items:[
    {id:"occupancy",name:"Aanwezigheid (PIR)",saref:"saref:Sensor",prop:"saref:Occupancy",unit:"bool",tab:["house","energy"],protocol:"Zigbee"},
    {id:"door_contact",name:"Deur/raamsensor",saref:"saref:Sensor",prop:"saref:OpenClose",unit:"bool",tab:["house","canary"],protocol:"Zigbee"},
    {id:"noise",name:"Geluid (ventilatie)",saref:"saref:Sensor",prop:"saref:Noise",unit:"dB(A)",tab:["health"],protocol:"I²C"},
    {id:"lux",name:"Lichtsensor (daglicht)",saref:"saref:Sensor",prop:"saref:Light",unit:"lux",tab:["house","energy"],protocol:"Zigbee"},
    {id:"co_alarm",name:"CO-melder",saref:"saref:Sensor",prop:"s4envi:Chemical",unit:"ppm",tab:["health"],protocol:"Z-Wave"},
    {id:"smoke",name:"Rookmelder",saref:"saref:SmokeSensor",prop:"saref:Smoke",unit:"bool",tab:["health"],protocol:"Z-Wave"},
  ]},
  {cat:"Energie — Meters",icon:"🔌",desc:"Elektra, gas, water",items:[
    {id:"p1_meter",name:"Slimme meter (P1/DSMR)",saref:"saref:Meter",prop:"saref:Energy",unit:"kWh",tab:["energy"],protocol:"P1/DSMR"},
    {id:"p1_gas",name:"Gasmeter (P1)",saref:"saref:Meter",prop:"saref:Energy",unit:"m³",tab:["energy","house"],protocol:"P1/DSMR"},
    {id:"water_main",name:"Watermeter",saref:"saref:Meter",prop:"s4watr:Flow",unit:"L",tab:["health","energy"],protocol:"Pulse/LoRa"},
    {id:"elec_wp",name:"Submeter warmtepomp",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy","house"],protocol:"Modbus"},
    {id:"elec_boiler",name:"Submeter boiler/cv",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy","house"],protocol:"Modbus"},
    {id:"elec_vent",name:"Submeter ventilatie",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy","canary"],protocol:"S0-puls"},
    {id:"elec_ev",name:"Submeter laadpaal",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy"],protocol:"OCPP/Modbus"},
    {id:"elec_keuken",name:"Submeter keuken",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy","canary"],protocol:"S0-puls"},
    {id:"plug_was",name:"Stekker wasmachine",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy"],protocol:"Zigbee"},
    {id:"plug_droger",name:"Stekker droger",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy"],protocol:"Zigbee"},
    {id:"plug_vaatw",name:"Stekker vaatwasser",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy"],protocol:"Zigbee"},
    {id:"heat_meter",name:"Warmtemeter (GJ)",saref:"saref:Meter",prop:"saref:Energy",unit:"GJ",tab:["energy","house"],protocol:"M-Bus"},
  ]},
  {cat:"Opwek & Opslag",icon:"☀️",desc:"Zonnepanelen, batterij",items:[
    {id:"solar_inv",name:"Omvormer PV",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy"],protocol:"SunSpec/Modbus"},
    {id:"solar_str",name:"Paneelmonitoring (string)",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy"],protocol:"SunSpec"},
    {id:"battery",name:"Thuisbatterij",saref:"saref:Meter",prop:"saref:Energy",unit:"kWh",tab:["energy"],protocol:"Modbus/CAN"},
    {id:"bat_soc",name:"Batterij SoC",saref:"saref:Sensor",prop:"saref:Energy",unit:"%",tab:["energy"],protocol:"Modbus"},
    {id:"feed_in",name:"Teruglevering netto",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy"],protocol:"P1/DSMR"},
  ]},
  {cat:"HVAC — Verwarming & Koeling",icon:"♨️",desc:"Warmtepomp, CV, vloervw, airco",items:[
    {id:"wp_unit",name:"Warmtepomp (lucht-water)",saref:"s4bldg:HeatPump",prop:"saref:Temperature",unit:"°C",tab:["house","energy"],protocol:"Modbus/EMS"},
    {id:"wp_cop",name:"WP COP-meting",saref:"saref:Sensor",prop:"s4ener:COP",unit:"ratio",tab:["energy"],protocol:"Berekend"},
    {id:"wp_buffer",name:"Buffervat temp.",saref:"saref:TemperatureSensor",prop:"saref:Temperature",unit:"°C",tab:["house","energy"],protocol:"Modbus"},
    {id:"cv_ketel",name:"CV-ketel",saref:"s4bldg:Boiler",prop:"saref:Temperature",unit:"°C",tab:["house","energy"],protocol:"OpenTherm"},
    {id:"vloervw",name:"Vloerverwarming (zone)",saref:"s4bldg:SpaceHeater",prop:"saref:Temperature",unit:"°C",tab:["house"],protocol:"KNX/Modbus"},
    {id:"trv",name:"Smart TRV (radiatorkraan)",saref:"saref:Actuator",prop:"saref:Temperature",unit:"°C",tab:["house"],protocol:"Zigbee"},
    {id:"airco",name:"Airco / split-unit",saref:"s4bldg:SpaceHeater",prop:"saref:Temperature",unit:"°C",tab:["house","energy"],protocol:"IR/WiFi"},
  ]},
  {cat:"Ventilatie & Afzuiging",icon:"🌀",desc:"WTW, afzuigkap, kleppen, filters",items:[
    {id:"wtw_unit",name:"WTW-unit (balansvent.)",saref:"s4bldg:Fan",prop:"saref:FlowRate",unit:"m³/h",tab:["canary","health","energy"],protocol:"Modbus"},
    {id:"wtw_bypass",name:"WTW bypass-klep",saref:"saref:Actuator",prop:"saref:OpenClose",unit:"%",tab:["canary","house"],protocol:"Modbus"},
    {id:"wtw_filter",name:"WTW filterstatus",saref:"saref:Sensor",prop:"saref:Pressure",unit:"Pa",tab:["health"],protocol:"Modbus"},
    {id:"mech_c",name:"Afzuigbox (systeem C)",saref:"s4bldg:Fan",prop:"saref:FlowRate",unit:"m³/h",tab:["canary","health"],protocol:"Contact"},
    {id:"hood_ml",name:"Afzuigkap motorloos (ATAG)",saref:"s4bldg:Fan",prop:"saref:FlowRate",unit:"m³/h",tab:["canary"],protocol:"Contact"},
    {id:"hood_m",name:"Afzuigkap met motor",saref:"s4bldg:Fan",prop:"saref:FlowRate",unit:"m³/h",tab:["canary"],protocol:"WiFi"},
    {id:"klep_bad",name:"Luchtklep badkamer",saref:"saref:Actuator",prop:"saref:OpenClose",unit:"%",tab:["health"],protocol:"24V"},
    {id:"klep_toi",name:"Luchtklep toilet",saref:"saref:Actuator",prop:"saref:OpenClose",unit:"%",tab:["health"],protocol:"24V"},
    {id:"f7_filter",name:"Fijnstoffilter F7",saref:"s4bldg:Filter",prop:"s4envi:Filtration",unit:"%",tab:["canary","health"],protocol:"Passief"},
  ]},
  {cat:"Regeling & Actuatoren",icon:"🎛️",desc:"Thermostaat, zonwering, verlichting",items:[
    {id:"thermostat",name:"Kamerthermostaat",saref:"saref:Actuator",prop:"saref:Temperature",unit:"°C",tab:["house"],protocol:"OpenTherm"},
    {id:"therm_smart",name:"Slimme thermostaat",saref:"saref:Actuator",prop:"saref:Temperature",unit:"°C",tab:["house","energy"],protocol:"WiFi/API"},
    {id:"sunscreen",name:"Zonwering (screen)",saref:"saref:Actuator",prop:"saref:OpenClose",unit:"%",tab:["house","health"],protocol:"KNX"},
    {id:"rolluik",name:"Rolluik (Somfy io)",saref:"saref:Actuator",prop:"saref:OpenClose",unit:"%",tab:["house","health"],protocol:"Somfy io"},
    {id:"lighting",name:"Slimme verlichting",saref:"saref:Actuator",prop:"saref:Light",unit:"%",tab:["energy"],protocol:"Zigbee/DALI"},
    {id:"vent_switch",name:"Standenschakelaar",saref:"saref:Actuator",prop:"saref:State",unit:"stand",tab:["canary"],protocol:"Contact"},
  ]},
  {cat:"Mobiliteit",icon:"🚗",desc:"EV, laadpaal",items:[
    {id:"ev_charger",name:"Laadpaal (OCPP)",saref:"saref:Device",prop:"saref:Power",unit:"kW",tab:["energy"],protocol:"OCPP 2.0"},
    {id:"ev_soc",name:"Auto batterij SoC",saref:"saref:Sensor",prop:"saref:Energy",unit:"%",tab:["energy"],protocol:"API (merk)"},
    {id:"ev_schedule",name:"Laadschema EV",saref:"saref:Device",prop:"s4ener:PowerProfile",unit:"kWh",tab:["energy"],protocol:"OCPP/API"},
    {id:"ebike",name:"E-bike lader",saref:"saref:Meter",prop:"saref:Power",unit:"W",tab:["energy"],protocol:"Zigbee stekker"},
  ]},
  {cat:"Externe Diensten",icon:"🌐",desc:"Weer, tarieven, luchtkwaliteit API's",items:[
    {id:"weather",name:"Weerdata (KNMI/OWM)",saref:"saref:Service",prop:"saref:Temperature",unit:"multi",tab:["house","energy"],protocol:"REST API"},
    {id:"price",name:"Energietarieven (ENTSO-E)",saref:"saref:Service",prop:"s4ener:Price",unit:"€/kWh",tab:["energy"],protocol:"REST API"},
    {id:"rivm",name:"Luchtkwaliteit (RIVM)",saref:"saref:Service",prop:"s4envi:AQI",unit:"AQI",tab:["canary"],protocol:"REST API"},
    {id:"pollen",name:"Pollendata",saref:"saref:Service",prop:"s4envi:Pollen",unit:"index",tab:["canary","health"],protocol:"REST API"},
    {id:"grid_co2",name:"CO₂ elektriciteitsnet",saref:"saref:Service",prop:"s4envi:CO2",unit:"g/kWh",tab:["energy"],protocol:"REST API"},
    {id:"solar_fc",name:"Zonnestroomprognose",saref:"saref:Service",prop:"saref:Power",unit:"kWh",tab:["energy"],protocol:"Solcast/API"},
  ]},
];

// SVG Characters (compact)
function CanarySVG({type,t}){const P={happy:{m:"#3B9A42",d:"#2D7A33",b:"#E8913A",l:"#5C8A3E"},warn:{m:"#E8A817",d:"#C89220",b:"#D4864A",l:"#B8892A"},sick:{m:"#D4628A",d:"#B84E74",b:"#C87060",l:"#B06080"},outdoor:{m:"#5A7FA5",d:"#456B8D",b:"#C0956A",l:"#607890"},night:{m:"#B89830",d:"#9A7F20",b:"#C89050",l:"#9A8530"}};const c=P[type]||P.happy;return(<svg viewBox="0 0 130 130" width="110" height="110" style={{display:"block",margin:"0 auto"}}>{type==="happy"&&<><text x="100" y="22" fontSize="12" fill={t.textTer}>♪</text><text x="108" y="14" fontSize="9" fill={t.textTer}>♫</text></>}{type==="warn"&&<><text x="98" y="20" fontSize="14" fontWeight="700" fill={t.textTer}>z</text><text x="108" y="12" fontSize="10" fontWeight="700" fill={t.textTer}>z</text></>}{type==="sick"&&<><path d="M96,20 Q98,14 100,20" fill="none" stroke={c.m} strokeWidth="1.5" opacity="0.5"/><path d="M104,16 Q106,10 108,16" fill="none" stroke={c.m} strokeWidth="1.5" opacity="0.4"/></>}{type==="outdoor"&&<><circle cx="18" cy="24" r="5" fill={t.textTer} opacity="0.12"/><circle cx="110" cy="20" r="7" fill={t.textTer} opacity="0.1"/></>}{type==="night"&&<><text x="98" y="20" fontSize="12" fontWeight="700" fill={t.textTer}>z</text></>}<path d="M34,52 L24,32 L30,36 L26,20 L38,44Z" fill={c.d}/><ellipse cx="62" cy="66" rx="28" ry="26" fill={c.m}/><circle cx="82" cy="44" r="18" fill={c.m}/><ellipse cx="74" cy="54" rx="14" ry="12" fill={c.m}/><path d="M38,52 Q32,62 40,76 Q48,74 56,66 Q60,58 52,50 Q44,46 38,52Z" fill={c.d} opacity="0.55"/>{type==="sick"?<path d="M76,40 Q82,36 88,40" fill="none" stroke="#1A1A1A" strokeWidth="2.2" strokeLinecap="round"/>:(type==="warn"||type==="night")?<><circle cx="84" cy="40" r="6" fill="#FFF"/><circle cx="85" cy="41" r="4" fill="#1A1A1A"/><circle cx="87" cy="39" r="1.8" fill="#FFF"/><path d="M77,36 Q84,33 91,36 L91,40 Q84,37 77,40Z" fill={c.m}/></>:<><circle cx="84" cy="40" r="6" fill="#FFF"/><circle cx="85" cy="41" r="4" fill="#1A1A1A"/><circle cx="87" cy="38" r="2" fill="#FFF"/></>}<path d="M98,44 L110,42 L100,52Z" fill={c.b}/><line x1="50" y1="90" x2="46" y2="108" stroke={c.l} strokeWidth="2.2" strokeLinecap="round"/><line x1="46" y1="108" x2="40" y2="110" stroke={c.l} strokeWidth="1.8" strokeLinecap="round"/><line x1="46" y1="108" x2="46" y2="112" stroke={c.l} strokeWidth="1.8" strokeLinecap="round"/><line x1="46" y1="108" x2="52" y2="111" stroke={c.l} strokeWidth="1.8" strokeLinecap="round"/><line x1="72" y1="90" x2="74" y2="108" stroke={c.l} strokeWidth="2.2" strokeLinecap="round"/><line x1="74" y1="108" x2="68" y2="110" stroke={c.l} strokeWidth="1.8" strokeLinecap="round"/><line x1="74" y1="108" x2="74" y2="112" stroke={c.l} strokeWidth="1.8" strokeLinecap="round"/><line x1="74" y1="108" x2="80" y2="111" stroke={c.l} strokeWidth="1.8" strokeLinecap="round"/><line x1="18" y1="115" x2="110" y2="115" stroke={t.border} strokeWidth="0.5"/></svg>);}
function HouseSVG({type,accent,t}){const w=type==="hot"?"#FAECE7":type==="cool"?"#E6F1FB":type==="sleeping"?t.surfaceAlt:"#EAF3DE";const wn=type==="hot"?"#FF9F0A":type==="cool"?"#85B7EB":type==="sleeping"?t.textTer:"#FAC775";const dr=type==="sleeping"?t.textTer:"#8B6914";return(<svg viewBox="0 0 120 132" width="110" height="120" style={{display:"block",margin:"0 auto"}}><rect x="78" y="22" width="10" height="18" rx="1.5" fill={t.textTer} opacity="0.4"/><polygon points="60,18 18,42 102,42" fill={accent}/><rect x="22" y="42" width="76" height="72" rx="2.5" fill={w} stroke={accent} strokeWidth="1" opacity="0.92"/><rect x="22" y="110" width="76" height="5" rx="1.5" fill={accent} opacity="0.2"/><rect x="32" y="62" width="14" height="14" rx="2.5" fill={wn} stroke={accent} strokeWidth="0.7" opacity="0.9"/><rect x="74" y="62" width="14" height="14" rx="2.5" fill={wn} stroke={accent} strokeWidth="0.7" opacity="0.9"/>{type==="happy"&&<><path d="M35,69 Q39,66 43,69" fill="none" stroke={dr} strokeWidth="1.2" strokeLinecap="round"/><path d="M77,69 Q81,66 85,69" fill="none" stroke={dr} strokeWidth="1.2" strokeLinecap="round"/></>}{type==="hot"&&<><circle cx="39" cy="68" r="2.2" fill={dr}/><circle cx="81" cy="68" r="2.2" fill={dr}/></>}{(type==="cool"||type==="sleeping")&&<><line x1="35" y1="69" x2="43" y2="69" stroke={type==="sleeping"?t.textTer:dr} strokeWidth="1.2" strokeLinecap="round"/><line x1="77" y1="69" x2="85" y2="69" stroke={type==="sleeping"?t.textTer:dr} strokeWidth="1.2" strokeLinecap="round"/></>}<rect x="52" y="86" width="16" height="24" rx="1.5" fill={dr}/><circle cx="65" cy="98" r="1.2" fill={accent} opacity="0.5"/>{type==="happy"&&<path d="M48,116 Q60,122 72,116" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>}{type==="hot"&&<ellipse cx="60" cy="118" rx="4" ry="2.2" fill="none" stroke={accent} strokeWidth="1.2"/>}{type==="cool"&&<path d="M50,117 Q60,114 70,117" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>}{type==="sleeping"&&<line x1="52" y1="118" x2="68" y2="118" stroke={t.textTer} strokeWidth="1.2" strokeLinecap="round"/>}</svg>);}
function ShieldSVG({type,t}){const C={danger:{f:"#FF3B30",g:"#FF453A",l:"SCHIMMEL"},moisture:{f:"#007AFF",g:"#5AC8FA",l:"VOCHT"},heat:{f:"#FF9F0A",g:"#FFD60A",l:"HITTE"},system:{f:"#FF9F0A",g:"#FFCC02",l:"SYSTEEM"},ok:{f:"#34C759",g:"#30D158",l:"GEZOND"}};const c=C[type]||C.ok;return(<svg viewBox="0 0 120 130" width="100" height="110" style={{display:"block",margin:"0 auto"}}><defs><linearGradient id={`sg_${type}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.g} stopOpacity="0.25"/><stop offset="100%" stopColor={c.f} stopOpacity="0.08"/></linearGradient></defs><path d="M60,10 L100,28 L100,68 Q100,100 60,118 Q20,100 20,68 L20,28Z" fill={`url(#sg_${type})`} stroke={c.f} strokeWidth="2" opacity="0.9"/><path d="M60,20 L90,34 L90,66 Q90,92 60,108 Q30,92 30,66 L30,34Z" fill={t.surface} stroke={c.f} strokeWidth="0.5" opacity="0.6"/>{type==="danger"&&<><circle cx="60" cy="54" r="3" fill={c.f}/><rect x="57.5" y="62" width="5" height="16" rx="2" fill={c.f}/></>}{type==="moisture"&&<path d="M60,44 Q54,56 54,64 Q54,72 60,76 Q66,72 66,64 Q66,56 60,44Z" fill={c.f} opacity="0.7"/>}{type==="heat"&&<text x="60" y="68" textAnchor="middle" fontSize="28" fill={c.f}>🌡</text>}{type==="system"&&<text x="60" y="68" textAnchor="middle" fontSize="28" fill={c.f}>⚙</text>}{type==="ok"&&<text x="60" y="72" textAnchor="middle" fontSize="30" fill={c.f}>✓</text>}<text x="60" y="96" textAnchor="middle" fontSize="10" fill={c.f} fontWeight="600">{c.l}</text></svg>);}
function BoltSVG({type,t}){const C={solar:{f:"#FFD60A",g:"#FF9F0A"},heatpump:{f:"#FF9F0A",g:"#FF6723"},peak:{f:"#FF3B30",g:"#FF453A"},ev:{f:"#34C759",g:"#30D158"},balance:{f:"#007AFF",g:"#5AC8FA"}};const c=C[type]||C.balance;const L={solar:"ZON",heatpump:"WP",peak:"PIEK",ev:"EV",balance:"BALANS"};return(<svg viewBox="0 0 120 130" width="100" height="110" style={{display:"block",margin:"0 auto"}}><defs><linearGradient id={`bg_${type}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.g} stopOpacity="0.2"/><stop offset="100%" stopColor={c.f} stopOpacity="0.05"/></linearGradient></defs><circle cx="60" cy="60" r="48" fill={`url(#bg_${type})`} stroke={c.f} strokeWidth="1.5" opacity="0.8"/><circle cx="60" cy="60" r="36" fill={t.surface} stroke={c.f} strokeWidth="0.5" opacity="0.5"/><path d="M68,22 L48,62 L58,62 L52,98 L78,52 L66,52Z" fill={c.f} opacity="0.85"/><text x="60" y="120" textAnchor="middle" fontSize="9" fill={c.f} fontWeight="600">{L[type]}</text></svg>);}

// Helpers
function Ring({v,label,max=100,color,t}){const r=24,C=2*Math.PI*r,pct=Math.min(v,max)/max;return(<div style={{textAlign:"center"}}><svg viewBox="0 0 60 60" width="56" height="56"><circle cx="30" cy="30" r={r} fill="none" stroke={t.border} strokeWidth="4.5" opacity="0.25"/><circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="4.5" strokeDasharray={`${pct*C} ${C}`} strokeLinecap="round" transform="rotate(-90 30 30)" style={{transition:"stroke-dasharray 0.5s ease"}}/><text x="30" y="34" textAnchor="middle" fontSize="15" fontWeight="600" fill={t.text}>{v}</text></svg><div style={{fontSize:10,color:t.textSec,marginTop:1}}>{label}</div></div>);}
function Pill({active,color,children,onClick,t}){return <button onClick={onClick} style={{padding:"6px 12px",borderRadius:18,border:`1px solid ${active?color:t.border}`,background:active?(t.bg==="#000000"?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)"):"transparent",color:active?t.text:t.textSec,fontSize:11,fontWeight:active?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",whiteSpace:"nowrap"}}>{children}</button>;}
function Dot({g,t}){return <span style={{display:"inline-block",width:5,height:5,borderRadius:3,background:g?t.good:t.bad,flexShrink:0,marginTop:5}}/>;}
function Badge({status,t}){const m={good:{bg:t.goodBg,c:t.goodT,l:"Goed"},warn:{bg:t.warnBg,c:t.warnT,l:"Let op"},bad:{bg:t.badBg,c:t.badT,l:"Actie"},info:{bg:t.infoBg,c:t.infoT,l:"Info"}};const s=m[status]||m.good;return <span style={{display:"inline-block",padding:"2px 9px",borderRadius:16,fontSize:10,fontWeight:600,background:s.bg,color:s.c}}>{s.l}</span>;}

// Main App
export default function App(){
  const [dark,setDark]=useState(false);
  const [tab,setTab]=useState("house");
  const [idx,setIdx]=useState(0);
  const [showConfig,setShowConfig]=useState(false);
  const [mode,setMode]=useState("test");
  const [devices,setDevices]=useState(["temp_in_wk","temp_out","co2_wk","pm25_in","rh_wk","rh_bath","p1_meter","p1_gas","wp_unit","wtw_unit","hood_ml","thermostat","solar_inv","ev_charger","weather","price"]);
  const [expandedCat,setExpandedCat]=useState(null);
  const t=dark?T.dark:T.light;
  const data=tab==="house"?HOUSE:tab==="canary"?CANARY:tab==="health"?HEALTH:ENERGY;
  const s=data[idx]||data[0];
  const sc={good:t.good,warn:t.warn,bad:t.bad,info:t.info}[s.status];
  const allItems=SAREF_CATALOG.flatMap(c=>c.items);
  const font="'SF Pro Display','SF Pro Text',-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif";
  const card={background:t.surface,borderRadius:18,overflow:"hidden",boxShadow:dark?"0 2px 20px rgba(0,0,0,0.5)":"0 2px 14px rgba(0,0,0,0.06)",border:`1px solid ${t.border}`,transition:"all 0.3s"};

  useEffect(()=>{setIdx(0);},[tab]);
  const toggleDev=(id)=>setDevices(d=>d.includes(id)?d.filter(x=>x!==id):[...d,id]);

  const tabs=[{k:"house",l:"Verwarmen",i:"🏠"},{k:"canary",l:"Lucht",i:"🐦"},{k:"health",l:"Gezond",i:"🛡️"},{k:"energy",l:"Energie",i:"⚡"}];
  const sigLabel=tab==="house"?"Signalen":tab==="canary"?"Omgeving":tab==="health"?"Diagnose":"Energiestatus";

  return(
    <div style={{fontFamily:font,background:t.bg,minHeight:"100vh",padding:"16px 10px",transition:"background 0.3s"}}>
      <div style={{maxWidth:520,margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:700,color:t.text,margin:0,letterSpacing:-0.5}}>
              {tab==="house"?"SlimWonen":tab==="canary"?"AirCheq":tab==="health"?"Woninggezondheid":"Energiehuishouding"}
            </h1>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
              <p style={{fontSize:11,color:t.textTer,margin:0,letterSpacing:0.4}}>TDI500 · 3.3</p>
              <span style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:mode==="live"?t.goodBg:t.warnBg,color:mode==="live"?t.goodT:t.warnT,fontWeight:600}}>
                {mode==="live"?"📡 LIVE":"🧪 TEST"}
              </span>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setShowConfig(!showConfig)} style={{background:showConfig?t.info:"transparent",border:`1px solid ${showConfig?t.info:t.border}`,borderRadius:18,width:34,height:34,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:showConfig?"#fff":t.textSec,transition:"all 0.2s"}}>⚙</button>
            <button onClick={()=>setDark(!dark)} style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:18,width:34,height:34,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{dark?"☀️":"🌙"}</button>
          </div>
        </div>

        {/* CONFIG PANEL (slide-down overlay) */}
        {showConfig&&(
          <div style={{...card,marginBottom:14,maxHeight:500,overflowY:"auto"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:t.text}}>Bronnen ({devices.length})</div>
                <div style={{fontSize:10,color:t.textTer}}>SAREF v3.2.1 · ETSI TS 103 264</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:10,color:t.textSec}}>Test</span>
                <button onClick={()=>setMode(m=>m==="test"?"live":"test")} style={{width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",background:mode==="live"?t.good:t.border,position:"relative",transition:"background 0.2s"}}>
                  <span style={{position:"absolute",top:2,left:mode==="live"?20:2,width:18,height:18,borderRadius:9,background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
                </button>
                <span style={{fontSize:10,color:t.textSec}}>Live</span>
              </div>
            </div>
            {SAREF_CATALOG.map(cat=>(
              <div key={cat.cat}>
                <button onClick={()=>setExpandedCat(expandedCat===cat.cat?null:cat.cat)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 16px",background:"none",border:"none",borderBottom:`1px solid ${t.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <span style={{fontSize:14}}>{cat.icon}</span>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:t.text}}>{cat.cat}</div><div style={{fontSize:9,color:t.textTer}}>{cat.items.filter(x=>devices.includes(x.id)).length}/{cat.items.length} · {cat.desc}</div></div>
                  <span style={{fontSize:11,color:t.textTer,transition:"transform 0.2s",transform:expandedCat===cat.cat?"rotate(90deg)":"rotate(0)"}}>›</span>
                </button>
                {expandedCat===cat.cat&&<div style={{padding:"0 16px 8px"}}>{cat.items.map(dev=>{const on=devices.includes(dev.id);return(
                  <div key={dev.id} onClick={()=>toggleDev(dev.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",cursor:"pointer",borderBottom:`1px solid ${t.border}`,opacity:on?1:0.5}}>
                    <span style={{width:16,height:16,borderRadius:3,border:`1.5px solid ${on?t.good:t.border}`,background:on?t.good:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",flexShrink:0}}>{on?"✓":""}</span>
                    <div style={{flex:1}}><div style={{fontSize:10.5,color:t.text}}>{dev.name}</div><div style={{fontSize:8,color:t.textTer}}>{dev.saref} · {dev.protocol}</div></div>
                    <div style={{display:"flex",gap:2}}>{dev.tab.map(tb=><span key={tb} style={{fontSize:7,padding:"1px 3px",borderRadius:4,background:t.surfaceAlt,color:t.textTer}}>{tb==="house"?"🏠":tb==="canary"?"🐦":tb==="health"?"🛡️":"⚡"}</span>)}</div>
                  </div>);})}</div>}
              </div>
            ))}
            <div style={{padding:"10px 16px",borderTop:`1px solid ${t.border}`}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{["saref:core","saref4ener","saref4bldg","saref4envi","saref4syst","saref4watr"].map(e=><span key={e} style={{fontSize:8,padding:"2px 6px",borderRadius:6,background:t.surfaceAlt,color:t.textTer,border:`1px solid ${t.border}`}}>{e}</span>)}</div>
              <p style={{fontSize:9,color:t.textTer,margin:"6px 0 0"}}>HUPIE Datastekker (3.1) · Comfort Partners (3.2) · SlimWonen (3.3)</p>
            </div>
          </div>
        )}

        {/* Tab pills */}
        <div style={{display:"flex",gap:3,background:t.surfaceAlt,borderRadius:12,padding:3,marginBottom:14}}>
          {tabs.map(tb=>(
            <button key={tb.k} onClick={()=>setTab(tb.k)} style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",cursor:"pointer",fontSize:11.5,fontWeight:600,fontFamily:"inherit",background:tab===tb.k?t.surface:"transparent",color:tab===tb.k?t.text:t.textSec,boxShadow:tab===tb.k?"0 1px 3px rgba(0,0,0,0.08)":"none",transition:"all 0.2s"}}>{tb.i} {tb.l}</button>
          ))}
        </div>

        {/* Main card */}
        <div style={card}>
          <div style={{height:3,background:sc,transition:"background 0.4s"}}/>
          <div style={{display:"flex",padding:"12px 14px 8px",borderBottom:`1px solid ${t.border}`}}>
            {s.m.map((m,i)=><div key={i} style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,color:t.textTer,letterSpacing:0.5,textTransform:"uppercase"}}>{m.l}</div><div style={{fontSize:15,fontWeight:600,color:t.text,marginTop:1,fontFeatureSettings:"'tnum'"}}>{m.v}</div></div>)}
          </div>
          <div style={{display:"flex",padding:"16px 14px",gap:10,alignItems:"center"}}>
            <div style={{minWidth:72,textAlign:"center"}}><Ring v={s.ring.v} label={s.ring.label} color={sc} t={t}/><div style={{marginTop:6}}><Badge status={s.status} t={t}/></div></div>
            <div style={{flex:1,textAlign:"center"}}>
              {tab==="house"&&<HouseSVG type={s.char} accent={s.accent} t={t}/>}
              {tab==="canary"&&<CanarySVG type={s.canary} t={t}/>}
              {tab==="health"&&<ShieldSVG type={s.shield} t={t}/>}
              {tab==="energy"&&<BoltSVG type={s.bolt} t={t}/>}
            </div>
            <div style={{minWidth:128}}><div style={{fontSize:9,color:t.textTer,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>{sigLabel}</div>{s.sigs.map((sig,i)=><div key={i} style={{display:"flex",gap:5,marginBottom:6,alignItems:"flex-start"}}><Dot g={sig.g} t={t}/><span style={{fontSize:10.5,color:t.textSec,lineHeight:1.3}}>{sig.t}</span></div>)}</div>
          </div>
          <div style={{margin:"0 14px 14px",padding:"10px 12px",borderRadius:10,background:dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.018)",border:`1px solid ${t.border}`}}>
            <div style={{fontSize:9,color:t.textTer,letterSpacing:0.5,textTransform:"uppercase",marginBottom:3}}>💡 Advies</div>
            <p style={{fontSize:11,color:t.textSec,lineHeight:1.5,margin:0}}>{s.tip}</p>
          </div>
        </div>

        {/* Scenario pills */}
        <div style={{marginTop:14}}>
          <div style={{fontSize:9,color:t.textTer,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6,paddingLeft:4}}>Scenario's</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {data.map((sc2,i)=><Pill key={sc2.id} active={i===idx} color={{good:t.good,warn:t.warn,bad:t.bad,info:t.info}[sc2.status]} onClick={()=>setIdx(i)} t={t}>{sc2.icon} {sc2.label}</Pill>)}
          </div>
        </div>
        <p style={{fontSize:9,color:t.textTer,textAlign:"center",marginTop:18}}>TDI500 · TNO/GEEV · ETSI SAREF · PvE Gezonde Woningen 2026</p>
      </div>
    </div>
  );
}
