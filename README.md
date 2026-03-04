# Live Fleet Monitoring Platform

**Overview**
- Real-time fleet monitoring dashboard inspired by AI dashcam analytics platforms.
- Streams driver events, computes risk, and renders insights without page reloads.
- Works even without MySQL via in-memory storage for demos.

**Architecture**
- Flow: client/simulator → Express API → MySQL (optional) → Socket.io broadcast → React UI.

**Tech Stack**
- Backend: Node.js, Express, Socket.io, mysql2  
  - Entry: [backend/server.js](backend/server.js)  
  - DB init/schema: [backend/db/mysql.js](backend/db/mysql.js), [backend/db/schema.sql](backend/db/schema.sql)  
  - Routers: [backend/routes/events.js](backend/routes/events.js), [backend/routes/metrics.js](backend/routes/metrics.js)  
  - Websocket: [backend/socket/socket.js](backend/socket/socket.js)
- Frontend: React, Vite, TailwindCSS, Recharts, socket.io-client  
  - Entry: [frontend/src/main.jsx](frontend/src/main.jsx), [frontend/src/App.jsx](frontend/src/App.jsx)  
  - Pages: [Dashboard](frontend/src/pages/Dashboard.jsx), [Analytics](frontend/src/pages/Analytics.jsx), [About](frontend/src/pages/About.jsx), [Services](frontend/src/pages/Services.jsx), [Contact](frontend/src/pages/Contact.jsx)  
  - Components: [MetricCard](frontend/src/components/MetricCard.jsx), [SystemStatus](frontend/src/components/SystemStatus.jsx), [Alerts](frontend/src/components/Alerts.jsx), [DriverTable](frontend/src/components/DriverTable.jsx), [RiskBadge](frontend/src/components/RiskBadge.jsx), [Navbar](frontend/src/components/Navbar.jsx)
- Scripts: [package.json](package.json)

**Monorepo Structure**
```
backend/
  server.js
  routes/
    events.js
    metrics.js
  socket/
    socket.js
  db/
    mysql.js
    schema.sql
  simulator/
    eventGenerator.js
frontend/
  index.html
  src/
    App.jsx
    main.jsx
    index.css
    components/
      Navbar.jsx
      MetricCard.jsx
      SystemStatus.jsx
      Alerts.jsx
      DriverTable.jsx
      RiskBadge.jsx
    pages/
      Dashboard.jsx
      Analytics.jsx
      About.jsx
      Services.jsx
      Contact.jsx
```

**API**
- POST /api/events  
  Body: { driver_id, trip_id, event_type, speed }  
  Scoring: speeding/speed>80 +5, harsh_braking +8, drowsiness +15, phone_distraction +12  
  Trip risk: ≥3 violations → High  
  Broadcast: new_driver_event
- GET /api/metrics → totals
- GET /api/metrics/recent → latest events
- POST /api/sim/start | /stop | /generate → simulator controls (IDs 101–110)

**Setup**
- Requirements: Node.js 18+
- Install
  - npm install
  - npm run dev
- .env (root)
  - BACKEND_PORT=4000
  - MYSQL_HOST=localhost
  - MYSQL_PORT=3306
  - MYSQL_USER=youruser
  - MYSQL_PASSWORD=yourpass
  - MYSQL_DATABASE=okdriver
  - SIM_AUTOSTART=true
- URLs
  - Backend: http://localhost:4000
  - Frontend: http://localhost:5173

**System Design**
- Backend: Express endpoints, optional MySQL persistence, Socket.io for realtime, simple simulator.
- Frontend: Hash-based SPA with history.pushState (no reload), realtime via socket.io-client, charts via Recharts.

**Features**
- Dashboard: metrics, status, live dashcam embed, alerts, driver table, charts.
- Analytics: distribution by type, top drivers, average speed by type, minute-level trend.
