LLM-economics-experiment

LLM-economics-experiment/
│
├── src/                 # React frontend
├── backend/             # FastAPI backend
│   ├── main.py
│   ├── experiment.py
│   ├── models.py
│   └── requirements.txt
│
└── README.md

How to Run Backend

cd backend
pip install -r requirements.txt
uvicorn main:app --reload

How to Run Frontend

npm install
npm run dev



