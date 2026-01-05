import os 
from fastapi import FastAPI, UploadFile, File 
from fastapi.middleware.cors import CORSMiddleware 

from utils.extract_audio import extract_audio 
from utils.transcribe import transcribe_audio 
from utils.summarize import summarize_text 

app = FastAPI() 

app.add_middleware( CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], ) 

UPLOAD_DIR = "uploads" 
OUTPUT_DIR = "outputs" 
os.makedirs(UPLOAD_DIR, exist_ok=True) 
os.makedirs(OUTPUT_DIR, exist_ok=True) 

@app.post("/process-video") 
async def process_video(file: UploadFile = File(...)): 
    video_path = os.path.join(UPLOAD_DIR, file.filename) 
    with open(video_path, "wb") as f:
        f.write(await file.read()) 
        
    # extract audio via ffmpeg 
    audio_path = os.path.join(OUTPUT_DIR, "audio.wav") 
    extract_audio(video_path, audio_path) 
    
    # transcribe 
    text = transcribe_audio(audio_path) 
    
    # summarize 
    summary = summarize_text(text) 
    
    return { "status": "success", "filename": file.filename, "summary": summary }
    
    
    @app.get("/") 
    def index(): 
        return {"message": "AI Video Summarization Backend Running!"}