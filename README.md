# LLM-economics-experiment

This project implements an LLM-based economic simulation of a manufacturer–retailer game.  
The frontend (React + Vite) allows experiment configuration and visualization.  
The backend (FastAPI) runs the simulation and computes performance metrics.

---

## Project Structure

```
LLM-economics-experiment/
│
├── src/                  # React frontend
├── public/
├── backend/              # FastAPI backend
│   ├── main.py
│   ├── experiment.py
│   ├── models.py
│   └── requirements.txt
└── README.md
```

---

## How to Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run on:

```
http://localhost:8000
```

---

## How to Run Frontend

```bash
npm install
npm run dev
```

The frontend will run on:

```
http://localhost:5173
```

---

## Environment Variables

Backend requires a `.env` file inside the `backend` folder:

```
OPENAI_API_KEY=your_api_key_here
```

This file is ignored by Git for security.
