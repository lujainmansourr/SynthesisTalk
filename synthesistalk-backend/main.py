from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import fitz
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_store = {}

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    os.makedirs("uploads", exist_ok=True)
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())

    extracted_text = ""
    if file.filename.endswith(".pdf"):
        doc = fitz.open(file_location)
        for page in doc:
            extracted_text += page.get_text()
        doc.close()
    elif file.filename.endswith(".txt"):
        with open(file_location, "r", encoding="utf-8") as f:
            extracted_text = f.read()

    session_store[session_id] = {"extracted_text": extracted_text}

    return {"session_id": session_id, "message": "📄 File uploaded! What do you want to do? (Summarize / Extract Key Points)"}

@app.post("/api/analysis")
async def analyze_text(request: Request):
    data = await request.json()
    session_id = data.get("session_id")
    action = data.get("action", "").lower()

    if session_id not in session_store:
        return {"result": "Invalid session ID."}

    text = session_store[session_id]["extracted_text"]

    if action == "summarize":
        result = call_ngu(text, "Summarize the entire text into a single coherent paragraph.")
    elif action == "extract key points":
        # Updated prompt for clean, concise bullet points
        result = call_ngu(
            text,
            "Extract the key points in short, concise bullet points. Keep each point clear and direct. Avoid explanations or extra words."
        )
    else:
        result = "Unknown action. Try: Summarize / Extract Key Points."

    return {"result": result}

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message", "")
    context = data.get("context", "")

    full_prompt = f"{context}\n\n{message}" if context else message
    result = call_ngu(full_prompt, "")
    return {"reply": result}

def call_ngu(text, prompt_instruction):
    full_prompt = f"{prompt_instruction}\n\n{text[:4000]}" if prompt_instruction else text[:4000]
    try:
        response = requests.post(
            "https://ngullama.femtoid.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('NGU_API_KEY')}",
                "Content-Type": "application/json",
            },
            json={
                "model": os.getenv("NGU_MODEL"),
                "messages": [{"role": "user", "content": full_prompt}]
            }
        )
        response.raise_for_status()
        reply = response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        reply = f"LLM error (NGU): {str(e)}"
    return reply