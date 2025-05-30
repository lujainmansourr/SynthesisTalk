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
    allow_origins=["http://localhost:3000"], 
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

    session_store[session_id] = {
        "extracted_text": extracted_text,
        "context": []
    }

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
        result = call_ngu(text, "Extract the key points in clear, concise bullet points.")
    else:
        result = "Unknown action. Try: Summarize / Extract Key Points."

    session_store[session_id]["context"].append({"role": "AI", "content": result})

    return {"result": result}

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message", "")
    session_id = data.get("session_id")

    if session_id not in session_store:
        session_store[session_id] = {"context": []}

    session_store[session_id]["context"].append({"role": "user", "content": message})

    messages = session_store[session_id]["context"][-10:]

    is_web_search = data.get("web_search", False)

    if is_web_search:
        search_results = serpapi_search(message)
        if search_results:
            messages.append({
                "role": "system",
                "content": (
                    "Use the following up-to-date web search results to answer the user's query. "
                    "If irrelevant, ignore them. Respond factually and in the same language/style as user.\n\n"
                    f"Web search results:\n{search_results}"
                )
            })
        else:
            messages.append({"role": "system", "content": "No results found from web search."})

    result = call_ngu_with_context(messages)
    session_store[session_id]["context"].append({"role": "AI", "content": result})

    return {"reply": result, "session_id": session_id}


def serpapi_search(query):
    try:
        params = {
            "engine": "google",
            "q": query,
            "api_key": os.getenv("SERPAPI_KEY"),
            "num": "3"
        }
        response = requests.get("https://serpapi.com/search", params=params)
        response.raise_for_status()
        data = response.json()

        snippets = []
        for item in data.get("organic_results", [])[:3]:
            title = item.get("title")
            snippet = item.get("snippet")
            if title and snippet:
                snippets.append(f"{title}: {snippet}")

        return "\n".join(snippets) if snippets else None
    except Exception as e:
        return f"Web search failed: {str(e)}"


def call_ngu(prompt, instruction):
    try:
        response = requests.post(
            "https://ngullama.femtoid.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('NGU_API_KEY')}",
                "Content-Type": "application/json",
            },
            json={
                "model": os.getenv("NGU_MODEL"),
                "messages": [
                    {"role": "system", "content": instruction},
                    {"role": "user", "content": prompt}
                ]
            }
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"LLM error (NGU): {str(e)}"


def call_ngu_with_context(messages):
    try:
        response = requests.post(
            "https://ngullama.femtoid.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('NGU_API_KEY')}",
                "Content-Type": "application/json",
            },
            json={
                "model": os.getenv("NGU_MODEL"),
                "messages": messages
            }
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"LLM error (NGU): {str(e)}"
