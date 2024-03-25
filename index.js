import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchFromRadar, fetchFlight } from 'flightradar24-client';
import { FlightRadar24API } from 'flightradarapi';
const frApi = new FlightRadar24API();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/planes', async (req, res) => {
  const { n, w, s, e } = req.query;
  let bounds = frApi.getBoundsByPoint(39.01381327349885, -77.11370898619066, 20000);
  // console.log(n, w, s, e);
  // const flights = await fetchFromRadar(Number(n), Number(w), Number(s), Number(e));
  let flights = await frApi.getFlights(null, bounds);
  res.json(flights);
});
// https://github.com/JeanExtreme002/FlightRadarAPI/blob/main/nodejs/README.md
// https://www.npmjs.com/package/flightradar24-client

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});