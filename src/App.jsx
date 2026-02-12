import { useState } from "react"; // Import the useState hook from React to manage component state
// Import the three main pages/components of the application
import ExperimentSetup from "./ExperimentSetup"; 
import LiveRoundMonitor from "./LiveRoundMonitor";
import ResultsAndMetrics from "./ResultsAndMetrics.jsx";

// Main application component
export default function App() {

  // Create a state variable 'page' to track which screen should be displayed
  // Initial value is set to "setup", meaning the app starts on the Experiment Setup page
  const [page, setPage] = useState("setup");

  return (
    <>
      {page === "setup" && (
        <ExperimentSetup goLive={() => setPage("live")} />
      )}

      {page === "live" && (
        <LiveRoundMonitor goResults={() => setPage("results")} />
      )}

      {page === "results" && <ResultsAndMetrics />}
    </>
  );
}
