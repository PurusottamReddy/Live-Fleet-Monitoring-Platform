# Fleet Monitoring Dashboard

**Project Overview**
- Simulates a real-time fleet monitoring dashboard inspired by AI dashcam analytics platforms.
- Streams driver events to the UI, summarizes risk levels, and displays analytics in real time.
- Runs without MySQL by falling back to in-memory storage for easy demos.

**Architecture Diagram**
- Mermaid diagram: [architecture.mmd](file:///c:/OKDRIVER%20PROJECT/diagrams/architecture.mmd)
- Key flow:
  - Simulator or client posts events → Backend processes → DB store (if enabled) → Socket.io broadcast → React UI updates.

**Tech Stack**
- Backend: Node.js, Express, Socket.io, mysql2
  - Entry: [backend/server.js](backend/server.js)
  - DB init/schema: [backend/db/mysql.js](backend/db/mysql.js), [backend/db/schema.sql](backend/db/schema.sql)
  - Routers: [backend/routes/events.js](backend/routes/events.js), [backend/routes/metrics.js](backend/routes/metrics.js)
  - Websocket wiring: [backend/socket/socket.js](backend/socket/socket.js)
- Frontend: React, Vite, TailwindCSS, Recharts, socket.io-client
  - App entry: [frontend/src/main.jsx](frontend/src/main.jsx), [frontend/src/App.jsx](frontend/src/App.jsx)
  - Dashboard page: [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)
  - Components: [frontend/src/components/MetricCard.jsx](frontend/src/components/MetricCard.jsx), [frontend/src/components/SystemStatus.jsx](frontend/src/components/SystemStatus.jsx), [frontend/src/components/Alerts.jsx](frontend/src/components/Alerts.jsx), [frontend/src/components/DriverTable.jsx](frontend/src/components/DriverTable.jsx), [frontend/src/components/RiskBadge.jsx](frontend/src/components/RiskBadge.jsx)
- Scripts: [package.json](package.json)

**API Endpoints**
- POST /api/events
  - Body: { driver_id, trip_id, event_type, speed }
  - Accepts: speeding, harsh_braking, drowsiness, phone_distraction, normal
  - Scoring:
    - speeding or speed>80 → +5
    - harsh_braking → +8
    - drowsiness → +15
    - phone_distraction → +12
  - Trip risk: 3 violations → risk_level = High
  - Broadcast: new_driver_event
- GET /api/metrics
  - Returns: totalTrips, activeDrivers, totalViolations, fleetRiskScore
- GET /api/metrics/recent
  - Returns latest events
- POST /api/sim/start | /stop | /generate
  - Controls 10-driver simulator (IDs 101–110)

**Setup Instructions**
- Requirements: Node.js 18+
- Install:
  - npm install
  - npm run dev
- Environment (.env at project root):
  - BACKEND_PORT=4000
  - MYSQL_HOST=localhost
  - MYSQL_PORT=3306
  - MYSQL_USER=youruser
  - MYSQL_PASSWORD=yourpass
  - MYSQL_DATABASE=okdriver
  - SIM_AUTOSTART=true
- URLs:
  - Backend: http://localhost:4000
  - Frontend: http://localhost:5173

**System Design Explanation**
- Backend
  - Express API receives events and computes risk scores.
  - Optional MySQL persistence; if not available, operations proceed with in-memory state.
  - Socket.io broadcasts every new event to connected clients for real-time updates.
  - Metrics endpoints aggregate counts and summaries for dashboard.
- Frontend
  - Connects via socket.io-client to receive new_driver_event updates.
  - Derives analytics client-side (violations/min, distribution, status summary).
  - Displays metrics, charts (Recharts), alerts, and a driver table.
- Simulator
  - Provides controllable traffic of events for demo and testing via /api/sim endpoints.

**Dashboard Features**
- Metrics cards, system status, live dashcam embed, alerts list, driver table, analytics charts (violations over time, event distribution).
