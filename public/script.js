mapboxgl.accessToken = "pk.eyJ1IjoidG90b2IxMjE3IiwiYSI6ImNsbXo4NHdocjA4dnEya215cjY0aWJ1cGkifQ.OMzA6Q8VnHLHZP-P8ACBRw";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/totob1217/cltw5erko00rg01p4571t6o9q",
  center: [-77.0365, 38.8977],
  zoom: 5,
  cursor: "crosshair",
  attributionControl: false,
});

const geolocateControl = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  trackUserLocation: true,
  showUserLocation: true,
  fitBoundsOptions: {
    maxZoom: map.getZoom(),
  },
});

map.addControl(geolocateControl);

geolocateControl.on('geolocate', (event) => {
  if (event.target._lastQueryRendered) {
    return;
  }
});

map.on("load", () => {
  geolocateControl.trigger();
  
  map.addSource("trains", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: "trains",
    type: "circle",
    source: "trains",
    paint: {
      "circle-radius": 5,
      "circle-color": "red",
    },
  });

  map.addSource("aircraft", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: "aircraft",
    type: "circle",
    source: "aircraft",
    paint: {
      "circle-radius": 3,
      "circle-color": "blue",
    },
  });

  const updateTrainPositions = () => {
    console.log("Updating train positions...");
    fetch("https://api-v3.amtraker.com/v3/trains")
      .then((response) => response.json())
      .then((trains) => {
        const features = Object.values(trains)
          .flat()
          .map((train) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [train.lon, train.lat],
            },
            properties: {
              name: `${train.routeName} (${train.trainNum})`,
              timely: train.trainTimely,
              origin: `${train.origName} (${train.origCode})`,
              destination: `${train.destName} (${train.destCode})`,
            },
          }));

        map.getSource("trains").setData({
          type: "FeatureCollection",
          features,
        });
      })
      .catch((error) => console.error("Error:", error));
  };

  const updateAircraftPositions = () => {
    console.log("Updating aircraft positions...");
    // fetch("/planes?n=90&w=-180&s=-90&e=180")
    // fetch("/planes?n=39&w=40&s=-78&e=-77")
    fetch("/planes?n=39&w=40&s=35&e=41")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const features = data.map((plane) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [plane.longitude, plane.latitude], // lon, lat
          },
          properties: {
            callsign: plane.callsign || plane.registration || "Unknown",
            origin: plane.origin || "Unknown",
            destination: plane.destination || "Unknown",
            altitude: plane.altitude !== null ? `${plane.altitude} m` : null,
            speed: plane.speed !== null ? `${plane.speed} kt` : null,
            bearing: plane.bearing !== null ? `${plane.bearing}°` : null,
            model: plane.model || "Unknown",
          },
        }));

        map.getSource("aircraft").setData({
          type: "FeatureCollection",
          features,
        });
      })
      .catch((error) => console.error("Error:", error));
  };
  // https://opensky-network.org/api/states/all

  updateAircraftPositions();

  setInterval(updateAircraftPositions, 5000);

  updateTrainPositions();

  setInterval(updateTrainPositions, 60000);

  map.on("click", "trains", (e) => {
    const properties = e.features[0].properties;
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `
        <b>${properties.name}</b><br>
        ${properties.timely}<br>
        From: ${properties.origin}<br>
        To: ${properties.destination}
      `,
      )
      .addTo(map);
  });

  map.on("click", "aircraft", (e) => {
    const properties = e.features[0].properties;
    let popupContent = `<b>${properties.callsign}</b><br>Origin: ${properties.origin}`;

    if (properties.altitude) {
      popupContent += `<br>Altitude: ${properties.altitude}`;
    }

    if (properties.speed) {
      popupContent += `<br>Speed: ${properties.speed}`;
    }

    if (properties.heading) {
      popupContent += `<br>Heading: ${properties.heading}`;
    }

    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
  });

  map.on("mouseenter", "trains", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "trains", () => {
    map.getCanvas().style.cursor = "crosshair";
  });

  map.on("mouseenter", "aircraft", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "aircraft", () => {
    map.getCanvas().style.cursor = "crosshair";
  });
});
