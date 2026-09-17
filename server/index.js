const express = require("express");
const { Pool } = require("pg");
const path = require("node:path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const app = express();
const PORT = process.env.PORT || 4100;

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5433),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 5,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
});

pool.on("error", (error) => {
  console.error("Database connection error:", error.message);
});

app.get("/", (req, res) => {
  res.json({
    message: "My Task Manager backend is running",
  });
});

// Checks whether the application responds.
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "task-manager-learning",
    uptime: process.uptime(),
  });
});

// Checks whether the database responds.
app.get("/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ready", database: "connected" });
  } catch (error) {
    console.error("Readiness check failed:", error.message);
    res.status(503).json({
      status: "not ready",
      database: "unavailable",
    });
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, completed FROM tasks ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Reading tasks failed:", error.message);
    res.status(500).json({ error: "Could not load tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  const title = req.body?.title;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title must be a non-empty string",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed",
      [title.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Creating task failed:", error.message);
    res.status(500).json({ error: "Could not create task" });
  }
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL CHECK (length(trim(title)) > 0),
      completed BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  app.listen(PORT, "0.0.0.0", (error) => {
    if (error) {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    }

    console.log(`Database connected. Backend running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
