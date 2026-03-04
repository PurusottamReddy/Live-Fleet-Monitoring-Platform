const express = require('express');
const { broadcast } = require('../socket/socket');

function riskForEvent(evt) {
  const { event_type, speed } = evt;
  let level = 'Safe';
  if (speed > 100) level = 'High';
  else if (speed > 80) level = 'Warning';
  if (['drowsiness', 'phone_distraction', 'harsh_braking'].includes(event_type)) {
    if (level === 'Safe') level = 'Warning';
  }
  const score = level === 'High' ? 20 : level === 'Warning' ? 10 : 0;
  return { level, score };
}

function eventsRouter(pool) {
  const router = express.Router();
  const mem = {
    drivers: new Map(),
    trips: new Map(),
    events: [],
    violations: new Map(), // trip_id -> count
  };

  router.post('/', async (req, res) => {
    try {
      const { driver_id, trip_id, event_type, speed } = req.body || {};
      if (!driver_id || !trip_id || !event_type || typeof speed !== 'number') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      if (pool) {
        await pool.execute('INSERT IGNORE INTO drivers (id, name) VALUES (?, ?)', [driver_id, `Driver ${driver_id}`]);
        await pool.execute('INSERT IGNORE INTO trips (id, driver_id) VALUES (?, ?)', [trip_id, driver_id]);
      } else {
        mem.drivers.set(driver_id, { id: driver_id, name: `Driver ${driver_id}` });
        if (!mem.trips.has(trip_id)) mem.trips.set(trip_id, { id: trip_id, driver_id, risk_level: 'Safe', violations: 0 });
      }

      const { level: risk_level, score: risk_score } = riskForEvent({ event_type, speed });

      if (pool) {
        await pool.execute(
          'INSERT INTO events (driver_id, trip_id, event_type, speed, risk_score) VALUES (?, ?, ?, ?, ?)',
          [driver_id, trip_id, event_type, speed, risk_score]
        );
      } else {
        mem.events.push({ driver_id, trip_id, event_type, speed, risk_score, timestamp: Date.now(), risk_level });
      }

      const isViolation = event_type !== 'normal' || speed > 80;
      if (isViolation) {
        if (pool) {
          await pool.execute('UPDATE trips SET violations = violations + 1 WHERE id = ?', [trip_id]);
          const [[row]] = await pool.execute('SELECT violations FROM trips WHERE id = ?', [trip_id]);
          if (row && row.violations >= 3) {
            await pool.execute('UPDATE trips SET risk_level = ? WHERE id = ?', ['High', trip_id]);
          } else {
            await pool.execute('UPDATE trips SET risk_level = ? WHERE id = ?', [risk_level, trip_id]);
          }
        } else {
          const v = (mem.violations.get(trip_id) || 0) + 1;
          mem.violations.set(trip_id, v);
          const trip = mem.trips.get(trip_id);
          if (trip) trip.risk_level = v >= 3 ? 'High' : risk_level;
        }
      }

      const payload = {
        id: Date.now(),
        driver_id,
        trip_id,
        event_type,
        speed,
        risk_score,
        timestamp: Date.now(),
        risk_level,
      };
      broadcast('new_driver_event', payload);
      res.json({ status: 'ok', event: payload });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = (pool, io) => eventsRouter(pool, io);
