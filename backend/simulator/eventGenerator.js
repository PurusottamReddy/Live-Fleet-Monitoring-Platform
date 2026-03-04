const express = require('express');
const axios = require('axios');
let timer = null;

const DRIVERS = Array.from({ length: 20 }, (_, i) => 101 + i);

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomEvent(driverId) {
  const tripId = driverId * 100 + randomBetween(1, 5);
  const speed = randomBetween(30, 120);
  const types = ['normal', 'speeding', 'harsh_braking', 'drowsiness', 'phone_distraction'];
  const event_type = speed > 80 ? 'speeding' : pick(types);
  return { driver_id: driverId, trip_id: tripId, event_type, speed };
}

async function sendEvent(baseUrl, evt) {
  try {
    await axios.post(`${baseUrl}/api/events`, evt);
  } catch (e) {
    // swallow for simulator
  }
}

function start(pool, io) {
  const baseUrl = `http://localhost:${process.env.BACKEND_PORT || 4000}`;
  if (timer) return;
  const intervalMs = randomBetween(2000, 3000);
  timer = setInterval(() => {
    const driverId = pick(DRIVERS);
    const evt = randomEvent(driverId);
    sendEvent(baseUrl, evt);
  }, intervalMs);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function simulatorRouter(pool, io) {
  const router = express.Router();
  router.post('/start', (req, res) => {
    start(pool, io);
    res.json({ status: 'started' });
  });
  router.post('/stop', (req, res) => {
    stop();
    res.json({ status: 'stopped' });
  });
  router.post('/generate', (req, res) => {
    const baseUrl = `http://localhost:${process.env.BACKEND_PORT || 4000}`;
    const driverId = pick(DRIVERS);
    const evt = randomEvent(driverId);
    sendEvent(baseUrl, evt);
    res.json({ status: 'ok', event: evt });
  });
  return router;
}

function startSimulatorOnBoot(pool, io) {
  start(pool, io);
}

module.exports = { simulatorRouter, startSimulatorOnBoot };
