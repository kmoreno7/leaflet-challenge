// Map Layers
var basemap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'", {
  attribution:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
});

var themap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with options.
var map = L.map("map-id", {
  center: [40.7, -94.5],
  zoom: 3,
  layers: [themap]
});

// Create a baseMaps object to hold the streetmap layer.
var baseMaps = {
  "The Map": themap,
  "Base Map": basemap
};

var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Create layer fpr tectonic plate and earthquakes.
var overlayMaps = {
  "Tectonic Plates": tectonicplates,
  "Earthquakes": earthquakes
};

// Create a layer control, and pass it baseMaps and overlayMaps. Add the layer to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: true
}).addTo(map);

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
  console.log(data)

  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  function getColor(depth) {
    switch (true) {
      case depth > 90:
        return "#ea2c2c";
      case depth > 70:
        return "#ea822c";
      case depth > 50:
        return "#ee9c00";
      case depth > 30:
        return "#eecc00";
      case depth > 10:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,

    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "Magnitude: "
        + feature.properties.mag
        + "<br>Depth: "
        + feature.geometry.coordinates[2]
        + "<br>Location: "
        + feature.properties.place
      );
    }

  }).addTo(earthquakes);

  earthquakes.addTo(map);

  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [-10, 10, 30, 50, 70, 90];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i> "
        + grades[i]
        + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  legend.addTo(map);

  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {

    L.geoJson(platedata, {
      color: "orange",
      weight: 2
    })
      .addTo(tectonicplates);


    tectonicplates.addTo(map);
  });

})
