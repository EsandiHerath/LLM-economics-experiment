import { useEffect, useState } from "react";
import "./experiment.css";
import { API_BASE } from "./api";

export default function ResultsAndMetrics({ goSetup, goLive }) {
  // ---------- STATE VARIABLES ----------
  
  // Stores the list of aggregated experiment results returned from backend
  const [results, setResults] = useState([]);
  // Indicates whether results are still being loaded
  const [loading, setLoading] = useState(true);
  
  // ---------- FETCH RESULTS FROM BACKEND ----------

  // useEffect runs once when the component mounts.
  // It loads experiment results from the backend API.
  useEffect(() => {
    const loadResults = async () => {
      try {
        // Call the backend endpoint to get aggregated metrics
        const res = await fetch(`${API_BASE}/results`);

        // If the response is not successful, throw an error
        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        // Parse the JSON response
        const data = await res.json();
        // Ensure we always store an array in state
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        // Handle any errors (network issues, backend problems, etc.)
        console.error(err);
        alert("Could not load results. Is the backend running?");
      } finally {
        // Stop showing loading indicator once request completes
        setLoading(false);
      }
    };

    loadResults();
  }, []); // Empty dependency array → run only once on mount

  return (
    <div className="exp-page">
      <header className="exp-header">
        <h2>Results and Metrics</h2>
      </header>

      <div className="exp-body">
        <aside className="exp-sidebar">
          <nav className="exp-nav">
            <button className="exp-nav-item" type="button" onClick={goSetup}>
              Experiment Setup
            </button>
            <button className="exp-nav-item" type="button" onClick={goLive}>
              Live Round Monitor
            </button>
            <button className="exp-nav-item active" type="button">
              Results and Metrics
            </button>
          </nav>
        </aside>

        <main className="exp-main">
          <div className="exp-card">
            {loading ? (
              <div className="exp-muted">Loading...</div>
            ) : results.length === 0 ? (
              <div className="exp-muted">
                No results yet. Run an experiment first.
              </div>
            ) : (
              <div className="ram-table-wrap">
                <table className="ram-table">
                  <thead>
                    <tr>
                      <th>FRAME</th>
                      <th>ACCEPTANCE RATE</th>
                      <th>CONDITIONAL EFFICIENCY</th>
                      <th>OVERALL EFFICIENCY</th>
                      <th>MEAN RETAIL PRICE</th>
                      <th>TEMPERATURE</th>
                      <th>MEAN MANUFACTURER PROFIT</th>
                      <th>MEAN RETAILER PROFIT</th>
                      <th>MODEL</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i}>
                        <td>{r.frame ?? "-"}</td>
                        <td>{r.acceptance ?? "-"}</td>
                        <td>{Number(r.conditionalEfficiency ?? 0).toFixed(2)}</td>
                        <td>{Number(r.overallEfficiency ?? 0).toFixed(2)}</td>
                        <td>{Number(r.meanRetailPrice ?? 0).toFixed(1)}</td>
                        <td>{Number(r.temperature ?? 0).toFixed(1)}</td>
                        <td>{Number(r.meanManufacturerProfit ?? 0).toFixed(1)}</td>
                        <td>{Number(r.meanRetailerProfit ?? 0).toFixed(1)}</td>
                        <td className="ram-model">{r.model ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
