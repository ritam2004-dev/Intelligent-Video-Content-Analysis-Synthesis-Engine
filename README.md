# Intelligent Video Content Analysis & Synthesis Engine

An AI-powered web application that automatically converts long videos into concise and meaningful summaries using modern Speech Recognition and Natural Language Processing models.

---

## Current Features (Implemented)

- Upload video files (MP4)
- High-accuracy speech-to-text using OpenAI Whisper
- Abstractive text summarization using BART
- Speaker diarization using pyannote.audio
- Visual keyframe extraction using OpenCV
- Clean text summary and full transcript
- Simple, responsive frontend

---

## Tech Stack (Current)

## Frontend

- React.js
- Vite
- Tailwind CSS

### Backend

- Python
- FastAPI

### AI / ML

- OpenAI Whisper (ASR)
- BART (`facebook`)
- Hugging Face Transformers
- Pyannote.audio (Speaker Diarization)
- OpenCV (Keyframe Extraction)

---

## Application Workflow

1. User uploads a video file
2. Backend extracts audio from the video
3. Whisper converts audio to text
4. Transcript is cleaned and chunked
5. BART generates an abstractive summary
6. OpenCV extracts keyframes
7. Results are sent back to the frontend

---

## Structure

```
AI-video_summarizer/
├── backend/
│ ├── utils/
│ ├── main.py
│ ├── requirements.txt
│ └── .env.example
│
├── frontend/
│ ├── public/
│ ├── src/
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Screenshots

### Frontend

![frontend](https://github.com/user-attachments/assets/3c2da431-3a89-4ba1-8fb9-3fd751d15368)

### Output

![output](https://github.com/user-attachments/assets/11c6fd41-f6b3-4c07-8461-8ba83fb40b2d)

---

## Installation & Execution

### 1. Clone the Repository

```bash
git clone https://github.com/ritam2004-dev/Intelligent-Video-Content-Analysis-And-Synthesis-Engine.git
cd Intelligent-Video-Content-Analysis-And-Synthesis-Engine
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev

```
