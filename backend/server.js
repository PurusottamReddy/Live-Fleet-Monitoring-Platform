const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const { initPool, ensureSchema } = require('./db/mysql');
const eventsRouter = require('./routes/events');
const { attachSocket } = require('./socket/socket');
const { metricsRouter } = require('./routes/metrics');
const { simulatorRouter, startSimulatorOnBoot } = require('./simulator/eventGenerator');

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  const pool = await initPool();
  await ensureSchema(pool);

  attachSocket(io);
  app.use('/api/events', eventsRouter(pool, io));
  app.use('/api/metrics', metricsRouter(pool));
  app.use('/api/sim', simulatorRouter(pool, io));

  app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Fleet Monitoring Backend' });
  });

  const port = process.env.BACKEND_PORT || 4000;
  server.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });

  if (process.env.SIM_AUTOSTART === 'true') {
    startSimulatorOnBoot(pool, io);
  }
}

main();
