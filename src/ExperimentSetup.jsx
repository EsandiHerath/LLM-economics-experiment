import { useState } from "react";
import "./experiment.css";
import { API_BASE } from "./api";

export default function ExperimentSetup({ goLive }) {
  // ---------- UI STATE ----------
  // Whether each round is independent (no history). Currently this value is stored
  // only in the UI; it is NOT sent to the backend in the payload below.
  const [oneShot, setOneShot] = useState(true);

  // Experiment configuration
  const [frame, setFrame] = useState("LP"); // LP / TPT / QD
  const [temperature, setTemperature] = useState(0.5); // LLM temperature
  const [rounds, setRounds] = useState(50); // 50 or 200
  const [model, setModel] = useState(""); // model name

  // Prompt entered by the user
  const [manufacturerPrompt, setManufacturerPrompt] = useState("");
  const [retailerPrompt, setRetailerPrompt] = useState("");

  // ---------- ACTION: RUN EXPERIMENT ----------
  // Sends the selected experiment settings to the backend.
  // If the backend succeeds, we navigate to the Live Round Monitor screen.
  const runExperiment = async () => {
    // Payload that will be sent to the backend /run-experiment endpoint
    const payload = {
      frame,
      temperature,
      rounds,
      model,
      manufacturerPrompt,
      retailerPrompt,
    };

    try {
      // Send POST request to backend
      const res = await fetch(`${API_BASE}/run-experiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // If backend returns an error status (e.g., 422, 500), throw an error
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Request failed: ${res.status}`);
      }

      // Optional: read backend response
      // const data = await res.json();
      // console.log("Backend:", data);

      // Navigate to the Live Round Monitor screen once backend run is complete
      goLive?.(); // navigate after backend is ready
    } catch (err) {
      // If network/backend errors happen, show a message to the user
      console.error(err);
      alert("Backend error. Check FastAPI terminal/logs.");
    }
  };

  return (
    <div className="exp-page">
      {/* Top header bar */}
      <header className="exp-header">
        <h2>Experiment Setup</h2>
      </header>

      <div className="exp-body">
        {/* Sidebar */}
        <aside className="exp-sidebar">
          <nav className="exp-nav">
            <button className="exp-nav-item active" type="button">
              Experiment Setup
            </button>
            <button className="exp-nav-item" type="button">
              Live Round Monitor
            </button>
            <button className="exp-nav-item" type="button">
              Results and Metrics
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="exp-main">
          <div className="exp-card">
            <div className="exp-grid">
              {/* Left column */}
              <section className="exp-col">

                <label className="exp-check">
                  <input
                    type="checkbox"
                    checked={oneShot}
                    onChange={(e) => setOneShot(e.target.checked)}
                  />
                  <div>
                    <div className="exp-check-title">One-shot rounds</div>
                    <div className="exp-muted">(no history)</div>
                  </div>
                </label>

                <div className="exp-section-title" style={{ marginTop: 14 }}>
                  Frame selection
                </div>

                <label className="exp-radio">
                  <input
                    type="radio"
                    name="frame"
                    checked={frame === "LP"}
                    onChange={() => setFrame("LP")}
                  />
                  <span>Linear Pricing (LP)</span>
                </label>

                <label className="exp-radio">
                  <input
                    type="radio"
                    name="frame"
                    checked={frame === "TPT"}
                    onChange={() => setFrame("TPT")}
                  />
                  <span>Two-Part Tariff (TPT)</span>
                </label>

                <label className="exp-radio">
                  <input
                    type="radio"
                    name="frame"
                    checked={frame === "QD"}
                    onChange={() => setFrame("QD")}
                  />
                  <span>Quantity Discount (QD)</span>
                </label>
              </section>

              {/* Middle column */}
              <section className="exp-col">
                <div className="exp-section-title">Temperature 0.0 - 1.0</div>
                <div className="exp-slider-row">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                  />
                  <div className="exp-pill">{temperature.toFixed(1)}</div>
                </div>

                <div className="exp-section-title" style={{ marginTop: 14 }}>
                  Rounds per frame
                </div>

                <label className="exp-radio">
                  <input
                    type="radio"
                    name="rounds"
                    checked={rounds === 50}
                    onChange={() => setRounds(50)}
                  />
                  <span>50</span>
                </label>

                <label className="exp-radio">
                  <input
                    type="radio"
                    name="rounds"
                    checked={rounds === 200}
                    onChange={() => setRounds(200)}
                  />
                  <span>200</span>
                </label>

                <div className="exp-section-title" style={{ marginTop: 14 }}>
                  Select a Model
                </div>

                <select
                  className="exp-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="">Select a Model</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4.1">GPT-4.1</option>
                  <option value="llama">LLaMA</option>
                </select>
              </section>

              {/* Right column */}
              <section className="exp-col">
                <div className="exp-prompt-block">
                  <label className="exp-prompt-label">Manufacturer Prompt</label>
                  <textarea
                    className="exp-textarea"
                    value={manufacturerPrompt}
                    onChange={(e) => setManufacturerPrompt(e.target.value)}
                    placeholder="Manufacturer Prompt description"
                  />
                </div>

                <div className="exp-prompt-block" style={{ marginTop: 12 }}>
                  <label className="exp-prompt-label">Retailer Prompt</label>
                  <textarea
                    className="exp-textarea"
                    value={retailerPrompt}
                    onChange={(e) => setRetailerPrompt(e.target.value)}
                    placeholder="Retailer Prompt description"
                  />
                </div>
              </section>
            </div>

            <div className="exp-actions">
              <button className="run-btn" onClick={runExperiment}>
                RUN
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
