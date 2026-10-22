import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "todos";
const THEME_KEY = "todo-theme";

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((todo) => todo && typeof todo === "object")
      .map((todo, index) => ({
        id: todo.id ?? Date.now() + index,
        text: String(todo.text ?? ""),
        completed: Boolean(todo.completed),
        priority: ["low", "medium", "high"].includes(todo.priority)
          ? todo.priority
          : "medium",
        dueDate: typeof todo.dueDate === "string" ? todo.dueDate : "",
        createdAt: Number(todo.createdAt) || Date.now(),
      }))
      .filter((todo) => todo.text.trim());
  } catch {
    return [];
  }
}

function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      setMessage("Could not save tasks in browser storage.");
    }
  }, [todos]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The app can still work if browser storage is unavailable.
    }
  }, [theme]);

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;
  const progress = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;

  const visibleTodos = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = todos.filter((todo) => {
      const matchesSearch = todo.text.toLowerCase().includes(query);

      const matchesFilter =
        filter === "active"
          ? !todo.completed
          : filter === "completed"
            ? todo.completed
            : filter === "high"
              ? todo.priority === "high"
              : true;

      return matchesSearch && matchesFilter;
    });

    const priorityRank = { high: 3, medium: 2, low: 1 };

    result.sort((a, b) => {
      if (sortBy === "oldest") return a.createdAt - b.createdAt;
      if (sortBy === "alphabetical") {
        return a.text.localeCompare(b.text);
      }
      if (sortBy === "priority") {
        return priorityRank[b.priority] - priorityRank[a.priority];
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return b.dueDate ? 1 : 0;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [todos, filter, search, sortBy]);

  function handleAddTodo(event) {
    event.preventDefault();

    const text = task.trim();

    if (!text) {
      setMessage("Please enter a task first.");
      return;
    }

    const newTodo = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      completed: false,
      priority,
      dueDate,
      createdAt: Date.now(),
    };

    setTodos((previous) => [newTodo, ...previous]);
    setTask("");
    setPriority("medium");
    setDueDate("");
    setFilter("all");
    setMessage("Task added successfully.");
  }

  function handleToggleTodo(id) {
    setTodos((previous) =>
      previous.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    setMessage("Task status updated.");
  }

  function handleDeleteTodo(id) {
    setTodos((previous) => previous.filter((todo) => todo.id !== id));

    if (editingId === id) {
      cancelEdit();
    }

    setMessage("Task deleted.");
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate);
    setMessage("");
  }

  function saveEdit(id) {
    const text = editText.trim();

    if (!text) {
      setMessage("Task name cannot be empty.");
      return;
    }

    setTodos((previous) =>
      previous.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              text,
              priority: editPriority,
              dueDate: editDueDate,
            }
          : todo
      )
    );

    setEditingId(null);
    setEditText("");
    setMessage("Task updated successfully.");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setEditPriority("medium");
    setEditDueDate("");
  }

  function clearCompleted() {
    if (completedCount === 0) {
      setMessage("There are no completed tasks to clear.");
      return;
    }

    if (!window.confirm("Delete all completed tasks?")) return;

    setTodos((previous) => previous.filter((todo) => !todo.completed));
    setMessage("Completed tasks cleared.");
  }

  function clearAll() {
    if (todos.length === 0) {
      setMessage("Your task list is already empty.");
      return;
    }

    if (!window.confirm("Delete ALL tasks? This cannot be undone.")) return;

    setTodos([]);
    cancelEdit();
    setMessage("All tasks deleted.");
  }

  function getDueStatus(todo) {
    if (!todo.dueDate || todo.completed) return "";

    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (todo.dueDate < localToday) return "Overdue";
    if (todo.dueDate === localToday) return "Due today";
    return "";
  }

  function formatDate(dateString) {
    if (!dateString) return "";

    return new Date(`${dateString}T00:00:00`).toLocaleDateString(
      undefined,
      { day: "numeric", month: "short", year: "numeric" }
    );
  }

  return (
    <main className={`app ${theme}`}>
      <section className="todo-container">
        <header className="app-header">
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">
              ✓
            </div>

            <div>
              <h1>TaskFlow</h1>
              <p className="subtitle">
                Plan your day. Make it happen.
              </p>
            </div>
          </div>

          <button
            className="theme-button"
            type="button"
            onClick={() =>
              setTheme((previous) =>
                previous === "light" ? "dark" : "light"
              )
            }
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "☾ Dark" : "☀ Light"}
          </button>
        </header>

        <section className="stats-grid" aria-label="Task statistics">
          <article className="stat-card">
            <span className="stat-icon">▤</span>
            <p>Total tasks</p>
            <strong>{todos.length}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-icon active-icon">◷</span>
            <p>Active</p>
            <strong>{activeCount}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-icon completed-icon">✓</span>
            <p>Completed</p>
            <strong>{completedCount}</strong>
          </article>
        </section>

        <section className="progress-section">
          <div className="progress-label">
            <span>Overall progress</span>
            <strong>{progress}%</strong>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Task completion progress"
          >
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <section className="add-section">
          <h2>Add a new task</h2>

          <form className="add-form" onSubmit={handleAddTodo}>
            <label className="field full-field">
              <span>Task name</span>
              <input
                type="text"
                placeholder="What do you need to do?"
                value={task}
                onChange={(event) => setTask(event.target.value)}
                maxLength={200}
                aria-label="New task name"
              />
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="field">
              <span>Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>

            <button className="primary-button add-button" type="submit">
              <span aria-hidden="true">＋</span> Add Task
            </button>
          </form>
        </section>

        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <h2>Your tasks</h2>
              <p className="section-description">
                Stay focused on what matters.
              </p>
            </div>

            <span className="task-badge">{visibleTodos.length} shown</span>
          </div>

          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search your tasks..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search tasks"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <div className="toolbar">
            <div className="filter-buttons" aria-label="Filter tasks">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["completed", "Completed"],
                ["high", "High priority"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`filter-button ${
                    filter === value ? "active-filter" : ""
                  }`}
                  onClick={() => setFilter(value)}
                >
                  {label}
                  {value === "all" && (
                    <span className="filter-count">{todos.length}</span>
                  )}
                </button>
              ))}
            </div>

            <label className="sort-control">
              <span>Sort</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort tasks"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due date</option>
                <option value="alphabetical">A–Z</option>
              </select>
            </label>
          </div>

          {visibleTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                {search ? "⌕" : "✓"}
              </div>

              <h3>
                {search
                  ? "No matching tasks"
                  : todos.length === 0
                    ? "Your list is clear!"
                    : "No tasks in this view"}
              </h3>

              <p>
                {search
                  ? "Try another search term."
                  : todos.length === 0
                    ? "Add your first task above to get started."
                    : "Choose another filter to see your tasks."}
              </p>

              {search && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <ul className="todo-list">
              {visibleTodos.map((todo) => {
                const dueStatus = getDueStatus(todo);

                return (
                  <li
                    className={`todo-item ${
                      todo.completed ? "task-completed" : ""
                    }`}
                    key={todo.id}
                  >
                    {editingId === todo.id ? (
                      <form
                        className="edit-task-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          saveEdit(todo.id);
                        }}
                      >
                        <label className="field full-field">
                          <span>Edit task</span>
                          <input
                            className="edit-input"
                            type="text"
                            value={editText}
                            onChange={(event) =>
                              setEditText(event.target.value)
                            }
                            maxLength={200}
                            autoFocus
                          />
                        </label>

                        <div className="edit-fields">
                          <label className="field">
                            <span>Priority</span>
                            <select
                              value={editPriority}
                              onChange={(event) =>
                                setEditPriority(event.target.value)
                              }
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </label>

                          <label className="field">
                            <span>Due date</span>
                            <input
                              type="date"
                              value={editDueDate}
                              onChange={(event) =>
                                setEditDueDate(event.target.value)
                              }
                            />
                          </label>
                        </div>

                        <div className="todo-actions">
                          <button className="primary-button" type="submit">
                            Save
                          </button>

                          <button
                            className="secondary-button"
                            type="button"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <label className="todo-label">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id)}
                            aria-label={`Mark ${todo.text} ${
                              todo.completed ? "active" : "completed"
                            }`}
                          />

                          <span className="todo-text">{todo.text}</span>
                        </label>

                        <div className="todo-meta">
                          <span
                            className={`priority-badge priority-${todo.priority}`}
                          >
                            {todo.priority} priority
                          </span>

                          {todo.dueDate && (
                            <span
                              className={`due-date ${
                                dueStatus === "Overdue" ? "overdue" : ""
                              }`}
                            >
                              {dueStatus
                                ? `${dueStatus} · `
                                : "Due "}
                              {formatDate(todo.dueDate)}
                            </span>
                          )}
                        </div>

                        <div className="todo-actions">
                          <button
                            className="edit-button"
                            type="button"
                            onClick={() => startEdit(todo)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            type="button"
                            onClick={() => handleDeleteTodo(todo.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="app-footer">
          <p>
            {completedCount === todos.length && todos.length > 0
              ? "🎉 Amazing! All tasks completed."
              : `${activeCount} task${activeCount === 1 ? "" : "s"} left to do.`}
          </p>

          <div className="footer-actions">
            <button
              className="text-button"
              type="button"
              onClick={clearCompleted}
              disabled={completedCount === 0}
            >
              Clear completed
            </button>

            <button
              className="text-button danger-text"
              type="button"
              onClick={clearAll}
              disabled={todos.length === 0}
            >
              Clear all
            </button>
          </div>
        </footer>

        {message && (
          <div className="status-message" role="status">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}
      </section>

      <p className="page-note">
        Made for a more organized day · Your tasks are saved in this browser.
      </p>
    </main>
  );
}

export default App;