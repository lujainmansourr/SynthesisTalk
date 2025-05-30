import os
import uuid
import shutil
import uvicorn
import requests
import fitz  # PyMuPDF for PDF text extraction

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment variables
load_dotenv()

# Config
NGU_API_KEY = os.getenv("NGU_API_KEY")
NGU_BASE_URL = os.getenv("NGU_BASE_URL")
NGU_MODEL = os.getenv("NGU_MODEL")

# Validate essential variables
if not NGU_API_KEY or not NGU_BASE_URL or not NGU_MODEL:
    raise RuntimeError("❌ Missing one or more required environment variables.")

# Create FastAPI app
app = FastAPI()

# Allow CORS for all origins (you can restrict this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session storage for uploaded files
sessions = {}

@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{session_id}_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        sessions[session_id] = {
            "filename": file.filename,
            "filepath": file_path
        }

        return {
            "session_id": session_id,
            "message": f"✅ File '{file.filename}' uploaded successfully!"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/api/analyze")
async def analyze(data: dict):
    session_id = data.get("session_id")
    action = data.get("action")

    if not session_id or not action:
        raise HTTPException(status_code=400, detail="Missing session_id or action")

    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    file_path = session["filepath"]
    file_ext = os.path.splitext(file_path)[1].lower()

    # Extract file text based on type
    try:
        if file_ext == ".pdf":
            doc = fitz.open(file_path)
            content = "\n".join(page.get_text() for page in doc)
            doc.close()
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

        if not content.strip():
            raise ValueError("File has no readable text.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")

    # Build prompt for LLM
    prompt = f"Please {action} the following text:\n\n{content[:4000]}"

    try:
        response = requests.post(
            f"{NGU_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {NGU_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": NGU_MODEL,
                "messages": [{"role": "user", "content": prompt}]
            },
            timeout=20
        )
        response.raise_for_status()
        reply = response.json().get("choices", [{}])[0].get("message", {}).get("content", "⚠️ No reply")
        return {"result": reply}

    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"NGU error: {e.response.reason}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.post("/api/chat")
async def chat(data: dict):
    user_message = data.get("message")
    session_id = data.get("session_id")

    if not user_message or not session_id:
        raise HTTPException(status_code=400, detail="Missing message or session_id")

    messages = [{"role": "user", "content": user_message}]

    try:
        response = requests.post(
            f"{NGU_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {NGU_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": NGU_MODEL,
                "messages": messages
            },
            timeout=15
        )
        response.raise_for_status()
        reply = response.json().get("choices", [{}])[0].get("message", {}).get("content", "⚠️ No reply")
        return {
            "reply": reply,
            "session_id": session_id
        }

    except requests.exceptions.HTTPError as e:
        return JSONResponse(
            status_code=e.response.status_code,
            content={"reply": f"LLM error (NGU): {e.response.status_code} {e.response.reason}", "session_id": session_id}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"reply": f"Unexpected error: {str(e)}", "session_id": session_id}
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
