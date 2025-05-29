from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import openai
import requests
import os
from dotenv import load_dotenv

# 🔄 Load environment variables
load_dotenv()

app = FastAPI()

# 🔓 CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔧 Model selection: OPENAI, NGU, or GROQ
MODEL_SERVER = os.getenv("MODEL_SERVER", "OPENAI").upper()

# 🔑 API Keys and URLs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

NGU_API_KEY = os.getenv("NGU_API_KEY")
NGU_BASE_URL = os.getenv("NGU_BASE_URL")
NGU_MODEL = os.getenv("NGU_MODEL")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL")
GROQ_MODEL = os.getenv("GROQ_MODEL")

@app.get("/")
async def root():
    return {"message": f"AI backend is running using {MODEL_SERVER} model."}

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message")

    if not user_message:
        return {"reply": "❗ Please enter something to search or ask."}

    try:
        if MODEL_SERVER == "OPENAI":
            openai.api_key = OPENAI_API_KEY
            if not openai.api_key:
                raise ValueError("OPENAI_API_KEY is missing.")
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",  # Or "gpt-4" if allowed
                messages=[
                    {"role": "system", "content": "You are a smart research assistant."},
                    {"role": "user", "content": user_message}
                ]
            )
            reply = response['choices'][0]['message']['content'].strip()

        elif MODEL_SERVER == "NGU":
            res = requests.post(
                f"{NGU_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {NGU_API_KEY}", "Content-Type": "application/json"},
                json={"model": NGU_MODEL, "messages": [{"role": "user", "content": user_message}]}
            )
            res.raise_for_status()
            reply = res.json()["choices"][0]["message"]["content"]

        elif MODEL_SERVER == "GROQ":
            res = requests.post(
                f"{GROQ_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={"model": GROQ_MODEL, "messages": [{"role": "user", "content": user_message}]}
            )
            res.raise_for_status()
            reply = res.json()["choices"][0]["message"]["content"]

        else:
            return {"reply": f"❌ Invalid MODEL_SERVER '{MODEL_SERVER}'"}

    except Exception as e:
        print(f"🔥 AI error: {e}")
        reply = f"⚠️ AI error: {str(e)}"

    return {"reply": reply}
