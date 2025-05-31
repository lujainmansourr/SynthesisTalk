# SynthesisTalk

Welcome to **SynthesisTalk**, a smart chat and document analysis platform that combines a modern React-based frontend with a robust Python FastAPI backend.

## Team Members
- Zeina Ayman, ID: 202200351
- Lujain Ahmad, ID: 202201738
- Habiba Khalil, ID: 202200720

## Overview
SynthesisTalk allows users to:
- Chat with an AI assistant powered by GROQ and optional web search.
- Upload documents (PDFs and text files) for summary and key points extraction.
- Download chat as .txt file.
- Manage user profiles with Firebase authentication (Sign Up / Login / Guest).
- Store and revisit chat history.

## Features
✅ **Real-time AI chat** with smart document processing.  
✅ **Document upload & analysis** with summarization and bullet points.  
✅ **User authentication** (Firebase email/password & guest access).  
✅ **Persistent chat history** with editing and deletion.  
✅ **Modern UI/UX** with React, TailwindCSS, and responsive design.  
✅ **Backend** using FastAPI, PyMuPDF, and GROQ API for document processing.

## Tech Stack
- **Frontend**: React, TailwindCSS, Firebase, Axios
- **Backend**: FastAPI, Python, GROQ API, PyMuPDF
- **Authentication**: Firebase
- **Deployment**: GitHub 

## Project Structure
<br>SynthesisTalk/
<br>synthesistalk-frontend/   # React frontend app
<br>src/
<br>public/
<br>package.json
<br>synthesistalk-backend/    # FastAPI backend app
<br>main.py
<br>requirements.txt
<br>.env (environment variables)
<br>README.md

## Setup Instructions
- **Backend Setup**:
    cd synthesistalk-backend
    pip install fastapi uvicorn python-dotenv requests pymupdf
    Create .env with GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL, SERPAPI_KEY
    uvicorn main:app --reload
- **Frontend Setup**:
    cd synthesistalk-frontend
    npm install
    npm start

## Usage
1. Start the backend server (FastAPI)
2. Run the React frontend (localhost:3000)
3. Sign up or login (or use guest mode)
4. Chat, upload documents, and get insights!

## License
- This project is for educational purposes. Modify and distribute as needed.
