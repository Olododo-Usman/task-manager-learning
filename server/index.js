const express = require("express");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4100;

app.get("/", (req, res) => {
  res.json({
    message: "My Task Manager backend is running",
  });
});

const tasks = [
  {
    id: 1,
    title: "Learn how a backend works",
    completed: false,
  },
  {
    id: 2,
    title: "Deploy my application to the cloud",
    completed: false,
  },
];

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});
app.post("/api/tasks", (req, res) => {
  const title = req.body?.title;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title must be a non-empty string",
    });
  }

  const newTask = {
    id: tasks.reduce((highest, task) => Math.max(highest, task.id), 0) + 1,
    title: title.trim(),
    completed: false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "task-manager-learning",
    uptime: process.uptime(),
  });
});
app.listen(PORT, "0.0.0.0", (error) => {
  if (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }

  console.log(`Backend running on port ${PORT}`);
});
