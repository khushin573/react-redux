import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialTasks = [
  {
    id: 1,
    title: "Complete React assignment",
    category: "Study",
    priority: "High",
    dueDate: "",
    completed: false,
    createdAt: Date.now() - 3000,
  },
  {
    id: 2,
    title: "Read JavaScript notes",
    category: "Study",
    priority: "Medium",
    dueDate: "",
    completed: false,
    createdAt: Date.now() - 2000,
  },
  {
    id: 3,
    title: "Organize daily schedule",
    category: "Personal",
    priority: "Low",
    dueDate: "",
    completed: true,
    createdAt: Date.now() - 1000,
  },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDueStatus(dueDate, completed) {
  if (!dueDate || completed) return "";

  const today = getLocalDate();

  if (dueDate < today) return "Overdue";
  if (dueDate === today) return "Due today";

  return "Upcoming";
}

function App() {
  const [tasks, setTasks] = useState(() =>
    readStorage("todo-v2-tasks", initialTasks)
  );

  const [darkMode, setDarkMode] = useState(() =>
    readStorage("todo-v2-dark-mode", false)
  );

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Study");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("todo-v2-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("todo-v2-dark-mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  const visibleTasks = useMemo(() => {
    let result = tasks.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase().trim())
    );

    if (filter === "Active") {
      result = result.filter((task) => !task.completed);
    } else if (filter === "Completed") {
      result = result.filter((task) => task.completed);
    } else if (filter === "High Priority") {
      result = result.filter(
        (task) => task.priority === "High" && !task.completed
      );
    } else if (filter === "Today") {
      result = result.filter(
        (task) => task.dueDate === getLocalDate() && !task.completed
      );
    }

    result = [...result];

    if (sortBy === "Newest") {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "Oldest") {
      result.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === "Priority") {
      const rank = { High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => rank[b.priority] - rank[a.priority]);
    } else if (sortBy === "Due Date") {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    }

    return result;
  }, [tasks, search, filter, sortBy]);

  function resetForm() {
    setTitle("");
    setCategory("Study");
    setPriority("Medium");
    setDueDate("");
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setMessage("Please enter a task name.");
      return;
    }

    if (editingId !== null) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingId
            ? {
                ...task,
                title: cleanTitle,
                category,
                priority,
                dueDate,
              }
            : task
        )
      );

      setMessage("Task updated successfully.");
    } else {
      const newTask = {
        id: Date.now(),
        title: cleanTitle,
        category,
        priority,
        dueDate,
        completed: false,
        createdAt: Date.now(),
      };

      setTasks((current) => [newTask, ...current]);
      setMessage("Task added successfully.");
    }

    resetForm();
  }

  function editTask(task) {
    setTitle(task.title);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate || "");
    setEditingId(task.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== id));

    if (editingId === id) resetForm();

    setMessage("Task deleted.");
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function clearCompleted() {
    if (!tasks.some((task) => task.completed)) {
      setMessage("There are no completed tasks to clear.");
      return;
    }

    if (!window.confirm("Clear all completed tasks?")) return;

    setTasks((current) => current.filter((task) => !task.completed));
    setMessage("Completed tasks cleared.");
  }

  function clearAll() {
    if (tasks.length === 0) {
      setMessage("Your task list is already empty.");
      return;
    }

    if (!window.confirm("Delete ALL tasks? This cannot be undone.")) {
      return;
    }

    setTasks([]);
    resetForm();
    setMessage("All tasks cleared.");
  }

  const filters = [
    "All",
    "Active",
    "Completed",
    "High Priority",
    "Today",
  ];

  return (
    <main className={`app ${darkMode ? "dark" : ""}`}>
      <div className="app-container">
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">✓</div>
            <div>
              <h1>TaskFlow</h1>
              <p>Your productivity workspace</p>
            </div>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode((current) => !current)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>

        <section className="welcome-section">
          <div>
            <span className="eyebrow">YOUR DAILY WORKSPACE</span>
            <h2>Make today count.</h2>
            <p>Organize your tasks, focus on priorities, and get things done.</p>
          </div>

          <div className="date-card">
            <span>Today</span>
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon">📋</span>
            <p>Total Tasks</p>
            <strong>{tasks.length}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-icon">⏳</span>
            <p>In Progress</p>
            <strong>{activeCount}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-icon">✅</span>
            <p>Completed</p>
            <strong>{completedCount}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-icon">📈</span>
            <p>Progress</p>
            <strong>{progress}%</strong>
          </article>
        </section>

        <section className="progress-card">
          <div className="progress-heading">
            <div>
              <h3>Daily progress</h3>
              <p>Keep going. Every completed task counts!</p>
            </div>
            <strong>{progress}%</strong>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <section className="task-form-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {editingId !== null ? "UPDATE TASK" : "PLAN YOUR DAY"}
              </span>
              <h2>{editingId !== null ? "Edit task" : "Add a new task"}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group full-width">
              <label htmlFor="task-title">Task name *</label>
              <input
                id="task-title"
                type="text"
                placeholder="What do you need to accomplish?"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-category">Category</label>
              <select
                id="task-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Study</option>
                <option>Work</option>
                <option>Personal</option>
                <option>Health</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-date">Due date (optional)</label>
              <input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <div className="form-actions full-width">
              <button type="submit" className="primary-button">
                {editingId !== null ? "Save Changes" : "+ Add Task"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && (
            <p className="status-message" role="status">
              {message}
            </p>
          )}
        </section>

        <section className="tasks-section">
          <div className="section-heading task-list-heading">
            <div>
              <span className="eyebrow">STAY ORGANIZED</span>
              <h2>Your tasks</h2>
            </div>
            <span className="task-count">
              {visibleTasks.length} shown
            </span>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search your tasks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search tasks"
              />
            </div>

            <div className="sort-control">
              <label htmlFor="sort-tasks">Sort by</label>
              <select
                id="sort-tasks"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option>Newest</option>
                <option>Oldest</option>
                <option>Priority</option>
                <option>Due Date</option>
              </select>
            </div>
          </div>

          <div className="filter-tabs">
            {filters.map((item) => (
              <button
                type="button"
                key={item}
                className={`filter-tab ${filter === item ? "active" : ""}`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="task-list">
            {visibleTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No tasks found</h3>
                <p>
                  Try another filter or add a new task to get started.
                </p>
              </div>
            ) : (
              visibleTasks.map((task) => {
                const dueStatus = getDueStatus(task.dueDate, task.completed);

                return (
                  <article
                    className={`task-item ${
                      task.completed ? "task-completed" : ""
                    }`}
                    key={task.id}
                  >
                    <button
                      type="button"
                      className={`task-checkbox ${
                        task.completed ? "checked" : ""
                      }`}
                      onClick={() => toggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? `Mark ${task.title} incomplete`
                          : `Complete ${task.title}`
                      }
                    >
                      {task.completed ? "✓" : ""}
                    </button>

                    <div className="task-content">
                      <h3>{task.title}</h3>

                      <div className="task-meta">
                        <span className="category-badge">
                          {task.category}
                        </span>

                        <span
                          className={`priority-badge priority-${task.priority.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>

                        {task.dueDate && (
                          <span
                            className={`due-status ${
                              dueStatus === "Overdue" ? "overdue" : ""
                            }`}
                          >
                            📅 {task.dueDate}
                            {dueStatus ? ` · ${dueStatus}` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        type="button"
                        className="icon-button edit-button"
                        onClick={() => editTask(task)}
                        aria-label={`Edit ${task.title}`}
                        title="Edit task"
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="icon-button delete-button"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="list-footer">
            <span>
              {completedCount} of {tasks.length} tasks completed
            </span>

            <div className="footer-actions">
              <button
                type="button"
                className="text-button"
                onClick={clearCompleted}
              >
                Clear completed
              </button>

              <button
                type="button"
                className="text-button danger-text"
                onClick={clearAll}
              >
                Clear all
              </button>
            </div>
          </div>
        </section>

        <footer className="app-footer">
          <p>Made for better focus, one task at a time. ✨</p>
          <span>TaskFlow · Todo App Version 2</span>
        </footer>
      </div>
    </main>
  );
}

export default App;