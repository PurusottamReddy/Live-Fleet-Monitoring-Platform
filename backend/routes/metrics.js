const express = require('express');

function metricsRouter(pool) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      if (!pool) {
        return res.json({
          totalTrips: 0,
          activeDrivers: 0,
          totalViolations: 0,
          fleetRiskScore: 0,
          violationsToday: 0,
        });
      }
      const [[{ totalTrips }]] = await pool.query('SELECT COUNT(DISTINCT trip_id) AS totalTrips FROM events');
      const [[{ activeDrivers }]] = await pool.query('SELECT COUNT(DISTINCT driver_id) AS activeDrivers FROM events');
      const [[{ totalViolations }]] = await pool.query("SELECT COUNT(*) AS totalViolations FROM events WHERE event_type <> 'normal'");
      const [[{ riskScore }]] = await pool.query('SELECT AVG(risk_score) AS riskScore FROM events');
      const [[{ violationsToday }]] = await pool.query("SELECT COUNT(*) AS violationsToday FROM events WHERE event_type <> 'normal' AND DATE(timestamp)=CURDATE()");
      res.json({ totalTrips, activeDrivers, totalViolations, fleetRiskScore: Math.round(riskScore || 0), violationsToday });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/recent', async (req, res) => {
    try {
      if (!pool) return res.json([]);
      const [rows] = await pool.query('SELECT * FROM events ORDER BY id DESC LIMIT 20');
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/driver-status', async (req, res) => {
    try {
      if (!pool) return res.json({ safe: 0, warning: 0, high: 0 });
      const [rows] = await pool.query('SELECT driver_id, MAX(risk_score) AS maxRisk FROM events GROUP BY driver_id');
      let safe = 0, warning = 0, high = 0;
      for (const r of rows) {
        if (r.maxRisk >= 20) high++;
        else if (r.maxRisk >= 10) warning++;
        else safe++;
      }
      res.json({ safe, warning, high });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/drivers', async (req, res) => {
    try {
      if (!pool) return res.json([]);
      const [rows] = await pool.query(`
        SELECT d.id AS driver_id, t.id AS trip_id, t.risk_level, t.violations
        FROM drivers d LEFT JOIN trips t ON d.id = t.driver_id
        ORDER BY d.id ASC
      `);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { metricsRouter };
