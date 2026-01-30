const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// for ESP fetch
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------------- STATE ----------------
let latestEvent = null;

let severityCount = {
  high: 0,
  medium: 0,
  low: 0
};

let totalPotholes = 0;

// ESP32 endpoint
const ESP_URL = "http://10.195.7.180/data"; // ✅ YOUR ESP IP

// ---------------- WEBSOCKET ----------------
io.on("connection", (socket) => {
  console.log("🟢 Dashboard connected");

  // send initial dashboard state
  socket.emit("dashboard:update", {
    totalPotholes,
    high: severityCount.high,
    medium: severityCount.medium,
    low: severityCount.low
  });
});

// ---------------- ML TRIGGER ----------------
app.post("/api/pothole", async (req, res) => {
  const { severity, image, timestamp } = req.body;

  if (!severity) {
    return res.status(400).json({ error: "Severity missing" });
  }

  const sev = severity.toLowerCase();
  if (!severityCount.hasOwnProperty(sev)) {
    return res.status(400).json({ error: "Invalid severity" });
  }

  // update counters
  severityCount[sev]++;
  totalPotholes++;

  // fetch ESP data
  let espData = null;
  try {
    const response = await fetch(ESP_URL);
    espData = await response.json();
  } catch {
    console.log("⚠️ ESP32 not reachable");
  }

  latestEvent = {
    mlSeverity: sev,
    espDepth: espData?.depth ?? null,
    espDistance: espData?.distance ?? null,
    timestamp: timestamp || new Date().toISOString()
  };

  // -------- CONSOLE LOG --------
  console.log("📡 POTHOLE EVENT (ML + ESP)");
  console.log("ML Severity :", sev);
  if (espData) {
    console.log("ESP Depth   :", espData.depth, "cm");
    console.log("ESP Dist    :", espData.distance, "cm");
  } else {
    console.log("ESP Data    : ❌ not available");
  }
  console.log("📊 COUNTS");
  console.log("High   :", severityCount.high);
  console.log("Medium :", severityCount.medium);
  console.log("Low    :", severityCount.low);
  console.log("TOTAL  :", totalPotholes);
  console.log("------------------------------------------");

  // 🔥 PUSH DASHBOARD UPDATE (KEY PART)
  io.emit("dashboard:update", {
    totalPotholes,
    high: severityCount.high,
    medium: severityCount.medium,
    low: severityCount.low
  });

  res.json({
    status: "ok",
    depth: espData?.depth ?? null,
    totalPotholes
  });
});

// ---------------- DEBUG (OPTIONAL) ----------------
app.get("/api/pothole", (req, res) => {
  res.json({
    latestEvent,
    counts: severityCount,
    totalPotholes
  });
});

// ---------------- START SERVER ----------------
server.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});
