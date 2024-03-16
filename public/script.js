// Initialize the Leaflet map
const map = L.map('map').setView([38.8977, -77.0365], 5);

// Add a tile layer for the base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(map);

// Fetch all active Amtrak trains
fetch('https://api-v3.amtraker.com/v3/trains')
  .then(response => response.json())
  .then(trains => {
    // Iterate over the trains
    Object.values(trains).flat().forEach(train => {
      // Create a marker for each train
      const marker = L.marker([train.lat, train.lon]).addTo(map);

      // Bind a popup to the marker with train information
      marker.bindPopup(`
        <b>${train.routeName} (${train.trainNum})</b><br>
        ${train.trainTimely}<br>
        From: ${train.origName} (${train.origCode})<br>
        To: ${train.destName} (${train.destCode})
      `);
    });
  })
  .catch(error => console.error('Error:', error));