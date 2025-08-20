// Initialize map
const map = L.map('map', {
    center: [47.8, 13.05],
    zoom: 15,
    zoomControl: false
});

// Base layers
const CartoDB_Positron = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

const OpenStreetMapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
});

const baseMaps = {
    "CartoDB Positron": CartoDB_Positron,
    "OpenStreetMap": OpenStreetMapLayer
};

// Add scale bar
L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);

// Walkability profiles
const profiles = {
    "General Walkability": {
        url: "/static/walkability/data/netascore_salzburg_walk.json",
        attribute: "index_walk_ft"
    },
    "Walkability for Women at Night": {
        url: "/static/walkability/data/netascore_salzburg_walk_night.json",
        attribute: "index_walk_night_ft"
    },
    "Walkability for Caregivers with Children": {
        url: "/static/walkability/data/netascore_salzburg_walk_child.json",
        attribute: "index_walk_child_ft"
    }
};

// Popup configuration
const popupConfig = {
    "General Walkability": [
        { key: "index_walk_ft", label: "Walkability Index" },
        { key: "max_speed_ft", label: "Max Speed" },
        { key: "pedestrian_infrastructure_ft", label: "Pedestrian Infrastructure" },
        { key: "facilities", label: "Facilities (within 30m buffer)" }
    ],
    "Walkability for Women at Night": [
        { key: "index_walk_night_ft", label: "Walkability Index" },
        { key: "lit", label: "Lighting" },
        { key: "facilities_night", label: "Night-friendly facilities <br> (within 30m buffer)" },
        { key: "buildings", label: "Buildings (within 30m buffer)" }
    ],
    "Walkability for Caregivers with Children": [
        { key: "index_walk_child_ft", label: "Walkability Index" },
        { key: "pavement", label: "Pavement" },
        { key: "stairs", label: "Stairs" },
        { key: "width", label: "Width" },
        { key: "facilities_child", label: "Child-friendly facilities <br> (within 30m buffer)" }
    ]
};

// Build popup content
function buildPopupContent(profileName, feature) {
    const config = popupConfig[profileName];
    if (!config) return `No popup configuration`;

    let html = `<table>`;
    config.forEach(field => {
        let val = feature.properties[field.key];

        if (field.key === "lit") {
            val = (val == 1 || val === "1") ? "Yes" : (val == 0 || val === "0") ? "No" : "n/a";
        }

        html += `<tr><td><b>${field.label}:</b></td><td>${val !== undefined ? val : "n/a"}</td></tr>`;
    });
    html += `</table>`;
    return html;
}

// Color scale
function getColor(value) {
    if (value == null) return '#cccccc';
    return value <= 0.2 ? '#d73027' :
           value <= 0.4 ? '#fc8d59' :
           value <= 0.6 ? '#fee08b' :
           value <= 0.8 ? '#91bfdb' :
                          '#4575b4';
}

// Style function for GeoJSON
function createStyle(attributeName) {
    return function(feature) {
        const val = feature.properties[attributeName];
        const numeric = parseFloat(val);
        const fillColor = (isNaN(numeric)) ? '#cccccc' : getColor(numeric);
        return {
            fillColor: fillColor,
            weight: 2,
            opacity: 1,
            color: fillColor,
            fillOpacity: 0.9
        };
    };
}

let currentLayer = null;

// Load profile
function loadProfile(profileName) {
    const profile = profiles[profileName];
    if (currentLayer) map.removeLayer(currentLayer);

    fetch(profile.url)
        .then(resp => resp.json())
        .then(data => {
            const styleFunc = createStyle(profile.attribute);
            currentLayer = L.geoJSON(data, {
                style: styleFunc,
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(buildPopupContent(profileName, feature));
                }
            }).addTo(map);
            updateActiveButton(profileName);
        })
        .catch(err => console.error("Error loading data:", err));
}

// Update active profile button
function updateActiveButton(activeName) {
    document.querySelectorAll('.profile-control a').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim() === activeName);
    });
}

// Profile control (top-left)
const profileControl = L.control({ position: 'topleft' });
profileControl.onAdd = map => {
    const div = L.DomUtil.create('div', 'profile-control');
    div.innerHTML = '<h4>Walkability Profiles</h4>';
    for (const name of Object.keys(profiles)) {
        const link = L.DomUtil.create('a', '', div);
        link.href = '#';
        link.textContent = name;
        link.onclick = e => { e.preventDefault(); loadProfile(name); };
    }
    return div;
};
profileControl.addTo(map);

// Add layer & zoom controls
L.control.layers(baseMaps).addTo(map);
L.control.zoom({ position: 'topright' }).addTo(map);

// Legend
const legend = L.control({ position: 'bottomright' });
legend.onAdd = map => {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = '<h4>Walkability Index</h4>';
    const ranges = [
        {min: 0, max: 0.2, label: '0.0 - 0.2 (unsuitable)', color: '#d73027'},
        {min: 0.2, max: 0.4, label: '0.2 - 0.4', color: '#fc8d59'},
        {min: 0.4, max: 0.6, label: '0.4 - 0.6', color: '#fee08b'},
        {min: 0.6, max: 0.8, label: '0.6 - 0.8', color: '#91bfdb'},
        {min: 0.8, max: 1.0, label: '0.8 - 1.0 (very suitable)', color: '#4575b4'}
    ];
    ranges.forEach(r => {
        div.innerHTML += `<div class="legend-item">
            <span class="legend-color" style="background-color:${r.color}"></span>
            <span>${r.label}</span>
        </div>`;
    });
    return div;
};
legend.addTo(map);

// Load default profile
loadProfile("General Walkability");

// Calculate percentage of poor road segments
function calcPoorPercentage(geojson, attr) {
    let total = 0, poor = 0;
    geojson.features.forEach(f => {
        const val = f.properties[attr];
        if (val !== undefined) {
            total++;
            if (val <= 0.2) poor++;
        }
    });
    return total > 0 ? ((poor / total) * 100).toFixed(1) : 0;
}

// Load profile stats and append to sidebar
async function loadProfileStats(profiles) {
    const results = [];
    for (const [name, conf] of Object.entries(profiles)) {
        const response = await fetch(conf.url);
        const geojson = await response.json();
        results.push({ name, pct: calcPoorPercentage(geojson, conf.attribute) });
    }

    const statsDiv = document.createElement("div");
    statsDiv.className = "profile-stats";
    statsDiv.innerHTML = `
        <p><b>Percentage of unsuitable road segments in Salzburg</b></p>
        <ul>
            ${results.map(r => `<li><b>${r.name}:</b> ${r.pct}%</li>`).join("")}
        </ul>
        <p style="font-size: 0.6em; font-style: italic; margin-top: 1em;"> Data analysis powered by NetAScore.<br> Werner, C., Wendel, R., Kaziyeva, D., Stutz, P., van der Meer, L., Effertz, L., Zagel, B., & Loidl, M. (2024). NetAScore: An open and extendible software for segment-scale bikeability and walkability. <i>Environment and Planning B: Urban Analytics and City Science</i>, 0(0). <a href="https://doi.org/10.1177/23998083241293177" target="_blank">https://doi.org/10.1177/23998083241293177</a> </p>
    `;
    document.querySelector(".left-sidebar").appendChild(statsDiv);
}

document.addEventListener("DOMContentLoaded", () => loadProfileStats(profiles));
