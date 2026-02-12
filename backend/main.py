# Import FastAPI framework to create the backend API
from fastapi import FastAPI

# Import CORS middleware to allow frontend (React) to communicate with backend
from fastapi.middleware.cors import CORSMiddleware

# Import experiment configuration schema (Pydantic model)
from models import ExperimentConfig

# Import the main simulation logic
from experiment import run_simulation

# -------------------- APPLICATION INITIALIZATION --------------------

# Create FastAPI application instance
app = FastAPI()

# -------------------- CORS CONFIGURATION --------------------

# Enable Cross-Origin Resource Sharing (CORS)
# This allows the frontend running on localhost:5173 to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Frontend development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- TEMPORARY IN-MEMORY STORAGE --------------------

# Simple in-memory storage to keep:
# - The most recent round data
# - Aggregated experiment results
# Note: In a production system, this would be replaced by a database.
STORE = {
    "current_round": {},
    "results": []
}

# -------------------- API ENDPOINTS --------------------

# Health check endpoint
# Used to verify that the backend server is running correctly.
@app.get("/health")
def health():
    return {"status": "ok"}

# Endpoint to start a new experiment simulation.
# Receives experiment configuration from the frontend.
@app.post("/run-experiment")
def run_experiment(config: ExperimentConfig):
    # Run the experiment simulation using provided configuration
    last_round, metrics = run_simulation(config)

    # Store results in memory for later retrieval
    STORE["current_round"] = last_round
    STORE["results"] = metrics

    # Return confirmation response
    return {"status": "started"}

# Endpoint to retrieve data from the latest experiment round
@app.get("/round/current")
def get_current_round():
    return STORE["current_round"]

# Endpoint to retrieve aggregated experiment metrics
@app.get("/results")
def get_results():
    return STORE["results"]
