import { useEffect, useState } from "react";
import "./experiment.css";
import { API_BASE } from "./api";

export default function LiveRoundMonitor({ goResults }) {
  // ---------- STATE VARIABLES ----------
  // Holds the data for the current experiment round received from the backend
  const [roundData, setRoundData] = useState(null);

  // Tracks whether the data is still being loaded
  const [loading, setLoading] = useState(true);

  // ---------- DATA LOADING LOGIC ----------
  // useEffect runs once when the component is mounted.
  // It fetches the latest round data from the backend API.
  useEffect(() => {
    const loadCurrentRound = async () => {
      try {
        // Call backend endpoint to get the current round information
        const res = await fetch(`${API_BASE}/round/current`);

        // If the response is not successful, throw an error
        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        // Convert response to JSON and store it in state
        const data = await res.json();
        setRoundData(data);
      } catch (err) {
        // Handle network or backend errors
        console.error(err);
        alert("Could not load current round. Is the backend running?");
      } finally {
        // Loading is finished whether success or failure
        setLoading(false);
      }
    };

    loadCurrentRound();
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="exp-page">
      <header className="exp-header">
        <h2>Live Round Monitor</h2>
      </header>

      <div className="exp-body">
        <aside className="exp-sidebar">
          <nav className="exp-nav">
            <button className="exp-nav-item" type="button">
              Experiment Setup
            </button>
            <button className="exp-nav-item active" type="button">
              Live Round Monitor
            </button>
            <button className="exp-nav-item" type="button">
              Results and Metrics
            </button>
          </nav>
        </aside>

        <main className="exp-main">
          <div className="exp-card">
            <div className="lrm-center">
              <div className="lrm-title">For the current round:</div>

              {loading ? (
                <div className="exp-muted">Loading...</div>
              ) : !roundData || Object.keys(roundData).length === 0 ? (
                <div className="exp-muted">
                  No round data yet. Run an experiment first.
                </div>
              ) : (
                <ul className="lrm-list">
                  <li>Frame : {roundData.frame}</li>
                  <li>Manufacturer Choice : {roundData.manufacturerChoice}</li>
                  <li>Retailer Choice : {roundData.retailerChoice}</li>
                  <li>q={roundData.q}</li>
                  <li>
                    Temperature : {Number(roundData.temperature ?? 0).toFixed(2)}
                  </li>
                  <li>Model : {roundData.model}</li>
                </ul>
              )}

              <button className="run-btn" onClick={goResults}>
                RUN
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
