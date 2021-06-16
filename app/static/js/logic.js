// Declare global variables
let map;
let emissions;
let stations;
let states;

// Render Map
const renderMap = function() {
    Promise.allSettled(
        [
            d3.json("/api/v1.0/emission"),
            d3.json("/api/v1.0/temperature"),
            d3.json("/static/data/us-states.json")
        ]
    )
    .then((values) => {
        // Store data results into variables
        emissions = values[0].value;
        stations = values[1].value;
        states = values[2].value;

        // Render dropdown menu options
        const dropdownMenu = d3.select("#selDataset");
        const years = emissions.map(d => d.year).filter((value, index, self) => self.indexOf(value) === index).reverse();
        renderDropDownMenu(dropdownMenu, years);

        // Generate map overlay layers
        let emissionLayer = createEmissionsLayer(emissions, states, dropdownMenu.property("value"));
        let stationsLayer = createStationsLayer(stations, dropdownMenu.property("value"));

        // render Map with Layers
        map = createMap([emissionLayer, stationsLayer]);
    });
}

// Leaflet Map
const createMap = function(overlayLayers) {
    
    const lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
      });

    const darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    const satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
      });

    const baseMaps = {
        "Dark": darkMap,
        "Light": lightMap,
        "Satellite": satelliteMap
    };

    const overlayMaps = {
        "Emissions": overlayLayers[0],
        "Stations": overlayLayers[1]
    };

    const myMap = L.map("map", {
        center: [39.833332, -98.583336],
        zoom: 4,
        layers: [darkMap, overlayLayers[0], overlayLayers[1]]
    });

    const control = L.control.layers(baseMaps, overlayMaps)
    control.addTo(myMap);

    // return object that represents the map
    return {
        map: myMap,
        control: control,
        overlayLayers: overlayMaps,
        baseLayers: baseMaps,
    };
}

// Emissions Layer
const createEmissionsLayer = function(emissionData, states, year) {
    const yearData = emissionData.filter(d => d.year === year);
    const emissions = [];
    const layers = L.geoJSON(states, {
        style: function(feature) {
            const state = feature.properties.name;
            const color = getColor(yearData.find(d => d.state === state)["emission_value"]);
            return {
                fillColor: color,
                weight: 1,
                opacity: 1,
                color: "lightgray",
                fillOpacity: 0.7
            }
        },
        onEachFeature: function(feature, layer) {
            const state = feature.properties.name;
            layer.bindPopup(markerPopup(yearData.find(d => d.state === state)["emission_value"]));
            emissions.push(layer);
        }
    });

    return L.layerGroup(emissions);
}

// Stations Layer
const createStationsLayer = function(stationData, year) {
    let stations = stationData.filter(d => d.year === year);
    const markers = L.layerGroup();
    stations.forEach(station => {
        const marker = L.marker(L.latLng(station.latlng[0], station.latlng[1]));  
        marker.bindPopup(stationPopup(station));
        markers.addLayer(marker);
    });
    return markers;
}

// DropDown menu content
const renderDropDownMenu = function(element, data) {
    element.selectAll("option")
        .data(data)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
}

// Update map layers
const updateMapLayers = function(year) {
    map.control.removeLayer(map.overlayLayers.Emissions);
    map.map.removeLayer(map.overlayLayers.Emissions); 

    map.control.removeLayer(map.overlayLayers.Stations);
    map.map.removeLayer(map.overlayLayers.Stations);

    // get new emissions
    map.overlayLayers["Emissions"] = createEmissionsLayer(emissions, states, year);
    map.map.addLayer(map.overlayLayers.Emissions);
    map.control.addOverlay(map.overlayLayers.Emissions, "Emissions");

    // get new stations
    map.overlayLayers["Stations"] = createStationsLayer(stations, year);
    
    // if layer group has zero layers, do not add it to map
    if(Object.keys(map.overlayLayers["Stations"]._layers).length !== 0) {
        map.map.addLayer(map.overlayLayers.Stations);
        map.control.addOverlay(map.overlayLayers.Stations, "Stations");
    }
}

// TEMPLATE FUNCTIONS
// Marker Popup Template
const markerPopup = function(value) { 
    return `
        <div>CO2 Emission: ${value}</div>
    `
}

// Station Marker Popup Template
const stationPopup = function(station) {

    const degF = getFahrenheitFromCelsius(station.tavg);
    return `
    <div class="station-item">${station.station}</div>
        <div class="station-item-data-container">
            <div class="station-item-data-label">Avg. Temp:</div>
            <div class="station-item-data-values">
                <div>${parseFloat(station.tavg).toFixed(2)} &deg;C</div>
                <div>${parseFloat(degF).toFixed(2)} &deg;F</div>
            </div>
    </div>
    `;
}

// HELPER FUNCTIONS
// Color function for emissions gradiant
const getColor = function(d) {
    return d > 500 ? '#800026' :
           d > 250  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

// Convert temp to fahrenheit from celsius
const getFahrenheitFromCelsius = function(celsius) {
    return (celsius * (9 / 5)) + 32;
}

// RUNTIME
renderMap();

// Event Listeners
// On year change, update the map layers with new data
d3.select("#selDataset").on("change", function() {
    updateMapLayers(this.value);
});