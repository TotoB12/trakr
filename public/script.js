const map = L.map("map").setView([38.8977, -77.0365], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(map);

const trainMarkers = [];
const aircraftMarkers = [];

const trainMarkerClusterGroup = L.markerClusterGroup();
const aircraftMarkerClusterGroup = L.markerClusterGroup();

// const updateTrainPositions = () => {
//   fetch("https://api-v3.amtraker.com/v3/trains")
//     .then((response) => response.json())
//     .then((trains) => {
//       trainMarkers.forEach((marker) => marker.remove());
//       trainMarkers.length = 0;

//       Object.values(trains)
//         .flat()
//         .forEach((train) => {
//           const marker = L.marker([train.lat, train.lon]).addTo(map);

//           marker.bindPopup(`
//           <b>${train.routeName} (${train.trainNum})</b><br>
//           ${train.trainTimely}<br>
//           From: ${train.origName} (${train.origCode})<br>
//           To: ${train.destName} (${train.destCode})
//         `);

//           trainMarkers.push(marker);
//         });
//     })
//     .catch((error) => console.error("Error:", error));
// };

// const updateAircraftPositions = () => {
//   fetch("https://opensky-network.org/api/states/all")
//     .then((response) => response.json())
//     .then((data) => {
//       aircraftMarkers.forEach((marker) => marker.remove());
//       aircraftMarkers.length = 0;

//       data.states.forEach((state) => {
//         const [
//           icao24,
//           callsign,
//           origin_country,
//           time_position,
//           last_contact,
//           longitude,
//           latitude,
//           baro_altitude,
//           on_ground,
//           velocity,
//           true_track,
//         ] = state;

//         if (latitude !== null && longitude !== null) {
//           const marker = L.marker([latitude, longitude]).addTo(map);

//           let popupContent = `<b>${
//             callsign || "Unknown Callsign"
//           }</b><br>Origin: ${origin_country || "Unknown"}`;

//           if (baro_altitude !== null) {
//             popupContent += `<br>Altitude: ${baro_altitude.toFixed(2)} m`;
//           }

//           if (velocity !== null) {
//             popupContent += `<br>Speed: ${velocity.toFixed(2)} m/s`;
//           }

//           if (true_track !== null) {
//             popupContent += `<br>Heading: ${true_track.toFixed(2)}°`;
//           }

//           marker.bindPopup(popupContent);

//           aircraftMarkers.push(marker);
//         }
//       });
//     })
//     .catch((error) => console.error("Error:", error));
// };

const updateTrainPositions = () => {
  fetch('https://api-v3.amtraker.com/v3/trains')
    .then(response => response.json())
    .then(trains => {
      trainMarkerClusterGroup.clearLayers();

      Object.values(trains).flat().forEach(train => {
        const marker = L.marker([train.lat, train.lon]);

        marker.bindPopup(`
          <b>${train.routeName} (${train.trainNum})</b><br>
          ${train.trainTimely}<br>
          From: ${train.origName} (${train.origCode})<br>
          To: ${train.destName} (${train.destCode})
        `);

        trainMarkerClusterGroup.addLayer(marker);
      });

      trainMarkerClusterGroup.addTo(map);
    })
    .catch(error => console.error('Error:', error));
};

const updateAircraftPositions = () => {
  fetch('https://opensky-network.org/api/states/all')
    .then(response => response.json())
    .then(data => {
      aircraftMarkerClusterGroup.clearLayers();

      data.states.forEach(state => {
        const [icao24, callsign, origin_country, , , longitude, latitude, baro_altitude, on_ground, velocity, true_track] = state;

        if (latitude !== null && longitude !== null) {
          const marker = L.marker([latitude, longitude]);

          let popupContent = `<b>${callsign || 'Unknown Callsign'}</b><br>Origin: ${origin_country || 'Unknown'}`;

          if (baro_altitude !== null) {
            popupContent += `<br>Altitude: ${baro_altitude.toFixed(2)} m`;
          }

          if (velocity !== null) {
            popupContent += `<br>Speed: ${velocity.toFixed(2)} m/s`;
          }

          if (true_track !== null) {
            popupContent += `<br>Heading: ${true_track.toFixed(2)}°`;
          }

          marker.bindPopup(popupContent);

          aircraftMarkerClusterGroup.addLayer(marker);
        }
      });

      aircraftMarkerClusterGroup.addTo(map);
    })
    .catch(error => console.error('Error:', error));
};

updateAircraftPositions();

setInterval(updateAircraftPositions, 60000);

updateTrainPositions();

setInterval(updateTrainPositions, 60000);
