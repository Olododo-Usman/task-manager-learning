import { useEffect, useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Could not load tasks: ${response.status}`);
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => controller.abort();
  }, []);

  async function addTask(event) {
    event.preventDefault();

    if (!title.trim() || saving) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Could not create task: ${response.status}`);
      }

      const newTask = await response.json();

      setTasks((currentTasks) => [...currentTasks, newTask]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>My Task Manager</h1>
      <p>Add tasks and track your learning.</p>

      <form onSubmit={addTask}>
        <label htmlFor="task-title">New task: </label>

        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="For example: Learn Docker"
          disabled={saving}
          required
        />

        <button
          type="submit"
          disabled={loading || saving || !title.trim()}
        >
          {saving ? "Adding..." : "Add task"}
        </button>
      </form>

      {loading && <p>Loading tasks...</p>}
      {error && <p role="alert">{error}</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} — {task.completed ? "Completed" : "Pending"}
          </li>
        ))}
      </ul>
    </main>
  );
}
