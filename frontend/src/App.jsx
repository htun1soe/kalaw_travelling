
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);




  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error("API request failed");
        return res.json();
      })
      .then(setApiData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="#home">
          <span>🏔️</span> Kalaw<span className="logo-accent">Traveling</span>
        </a>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#explore">Explore</a>
          <a href="#about">About</a>
        </div>
        <a className="nav-button" href="#explore">Discover More</a>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">DISCOVER THE BEAUTY OF MYANMAR</span>
            <h1>Find your next <span>adventure.</span></h1>
            <p>
              Discover beautiful destinations, comfortable stays,
              local restaurants and unforgettable journeys.
            </p>
            <a href="#explore" className="primary-button">
              Start Exploring <span>→</span>
            </a>
          </div>
        </section>

        <section className="explore" id="explore">
          <div className="section-heading">
            <span className="section-label">EXPLORE WITH US</span>
            <h2>Everything for your journey.</h2>
            <p>All the essentials for a memorable trip, in one place.</p>
          </div>

          <div className="category-grid">
            {[
              ["🏡", "Accommodation", "Find your perfect place to stay."],
              ["🚗", "Vehicle Rental", "Travel freely at your own pace."],
              ["🍜", "Restaurants", "Discover local food and flavors."],
              ["🏞️", "Destinations", "Explore breathtaking places."]
            ].map(([icon, title, description]) => (
              <article className="category-card" key={title}>
                <div className="category-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="card-arrow">Explore →</span>
              </article>
            ))}
          </div>
        </section>

        <section className="api-section" id="about">
          <div className="api-header">
            <div>
              <span className="section-label">DEVELOPER DASHBOARD</span>
              <h2>Backend Connection</h2>
              <p>Live response from your Laravel API.</p>
            </div>

            <div className="connection">
              <span className={`status-dot ${loading ? "pending" : error ? "offline" : "online"}`} />
              {loading ? "Connecting..." : error ? "Connection Failed" : "Backend Connected"}
            </div>
          </div>

          <div className="api-grid">
            <div className="api-card">
              <span>STATUS</span>
              <strong>{loading ? "Checking..." : apiData?.status || "Unavailable"}</strong>
            </div>
            <div className="api-card">
              <span>MESSAGE</span>
              <strong>{loading ? "Waiting..." : apiData?.message || error || "Unavailable"}</strong>
            </div>
            <div className="api-card">
              <span>API VERSION</span>
              <strong>{loading ? "Waiting..." : apiData?.version || "Unknown"}</strong>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <strong>🏔️ Kalaw Traveling</strong>
        <span>© 2026 Kalaw Traveling. Built with React + Laravel.</span>
      </footer>
    </div>
  );
}

export default App;
