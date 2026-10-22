import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("bharat-clock-theme") === "dark";
    } catch {
      return false;
    }
  });

  const [hourFormat, setHourFormat] = useState(() => {
    try {
      return localStorage.getItem("bharat-clock-format") || "12";
    } catch {
      return "12";
    }
  });

  const [showSeconds, setShowSeconds] = useState(true);
  const [showDateDetails, setShowDateDetails] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";

    try {
      localStorage.setItem(
        "bharat-clock-theme",
        darkMode ? "dark" : "light"
      );
    } catch {
      // The clock still works if storage is unavailable.
    }

    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem("bharat-clock-format", hourFormat);
    } catch {
      // The clock still works if storage is unavailable.
    }
  }, [hourFormat]);

  const formatTime = () => {
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: hourFormat === "12",
    };

    if (showSeconds) {
      options.second = "2-digit";
    }

    return new Intl.DateTimeFormat("en-IN", options).format(currentTime);
  };

  const dateOptions = {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  const formattedDate = new Intl.DateTimeFormat(
    "en-IN",
    dateOptions
  ).format(currentTime);

  const dayName = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(currentTime);

  const shortDate = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(currentTime);

  const indiaHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(currentTime)
  );

  const greeting =
    indiaHour < 12
      ? "Good Morning"
      : indiaHour < 17
        ? "Good Afternoon"
        : indiaHour < 21
          ? "Good Evening"
          : "Good Night";

  const seconds = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    second: "2-digit",
  }).format(currentTime);

  const milliseconds = currentTime.getMilliseconds();

  const secondProgress = (Number(seconds) + milliseconds / 1000) / 60 * 100;

  return (
    <main className={`app-shell ${darkMode ? "dark" : "light"}`}>
      <div className="ambient ambient-one" aria-hidden="true"></div>
      <div className="ambient ambient-two" aria-hidden="true"></div>

      <header className="topbar">
        <a className="brand" href="#home" aria-label="Bharat Clock home">
          <span className="brand-flag" aria-hidden="true">🇮🇳</span>
          <span>
            <strong>Bharat Clock</strong>
            <small>INDIA · IST</small>
          </span>
        </a>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setDarkMode((previous) => !previous)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span aria-hidden="true">{darkMode ? "☀️" : "🌙"}</span>
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-badge">
          <span className="live-dot"></span>
          LIVE INDIAN TIME
        </div>

        <p className="greeting">{greeting}!</p>

        <h1>
          Time is precious.
          <span> Make every second count.</span>
        </h1>

        <p className="hero-description">
          A simple, elegant clock that keeps you connected to India Standard Time.
        </p>
      </section>

      <section className="clock-card" aria-label="Current time in India">
        <div className="card-top">
          <div className="location-info">
            <span className="location-icon" aria-hidden="true">📍</span>
            <div>
              <h2>India</h2>
              <p>Indian Standard Time</p>
            </div>
          </div>

          <span className="timezone-chip">UTC +05:30</span>
        </div>

        <div className="clock-display">
          <div className="clock-illustration" aria-hidden="true">🕰️</div>

          <div className="digital-time" aria-live="off">
            {formatTime()}
          </div>

          <p className="full-date">{formattedDate}</p>

          <div className="seconds-track" aria-hidden="true">
            <div
              className="seconds-fill"
              style={{ width: `${secondProgress}%` }}
            ></div>
          </div>

          <p className="clock-caption">
            <span className="live-dot"></span>
            Updating automatically every second
          </p>
        </div>

        <div className="date-panel">
          <div className="date-icon" aria-hidden="true">📅</div>
          <div className="date-copy">
            <span className="mini-label">TODAY</span>
            <strong>{shortDate}</strong>
          </div>
          <div className="date-day">
            <span className="mini-label">DAY</span>
            <strong>{dayName}</strong>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-heading">
          <div>
            <span className="mini-label">PERSONALIZE</span>
            <h2>Clock settings</h2>
          </div>
          <span className="settings-icon" aria-hidden="true">⚙️</span>
        </div>

        <div className="setting-row">
          <div className="setting-copy">
            <strong>Time format</strong>
            <p>Choose how the time is displayed</p>
          </div>

          <div className="format-switch" role="group" aria-label="Time format">
            <button
              type="button"
              className={hourFormat === "12" ? "selected" : ""}
              onClick={() => setHourFormat("12")}
              aria-pressed={hourFormat === "12"}
            >
              12-hour
            </button>
            <button
              type="button"
              className={hourFormat === "24" ? "selected" : ""}
              onClick={() => setHourFormat("24")}
              aria-pressed={hourFormat === "24"}
            >
              24-hour
            </button>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-copy">
            <strong>Show seconds</strong>
            <p>Display seconds on the digital clock</p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={showSeconds}
            className={`toggle-switch ${showSeconds ? "on" : ""}`}
            onClick={() => setShowSeconds((previous) => !previous)}
          >
            <span></span>
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-copy">
            <strong>Show date details</strong>
            <p>Display the full date below the time</p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={showDateDetails}
            className={`toggle-switch ${showDateDetails ? "on" : ""}`}
            onClick={() => setShowDateDetails((previous) => !previous)}
          >
            <span></span>
          </button>
        </div>

        {!showDateDetails && (
          <p className="settings-note">
            The full date is hidden. The date summary remains available below.
          </p>
        )}
      </section>

      <section className="info-grid">
        <article className="info-card">
          <span className="info-icon" aria-hidden="true">🌏</span>
          <p>TIME ZONE</p>
          <h3>Asia/Kolkata</h3>
          <span>Indian Standard Time</span>
        </article>

        <article className="info-card">
          <span className="info-icon" aria-hidden="true">⏱️</span>
          <p>UTC OFFSET</p>
          <h3>+05:30</h3>
          <span>5 hours 30 minutes ahead of UTC</span>
        </article>

        <article className="info-card">
          <span className="info-icon" aria-hidden="true">📆</span>
          <p>YOUR DAY</p>
          <h3>{dayName}</h3>
          <span>{shortDate}</span>
        </article>
      </section>

      <footer className="footer">
        <div className="footer-flag" aria-hidden="true">🇮🇳</div>
        <p>Designed with <span>♥</span> in India</p>
        <small>BHARAT CLOCK · REACT PROJECT</small>
      </footer>
    </main>
  );
}

export default App;