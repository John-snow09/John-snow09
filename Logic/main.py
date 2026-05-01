from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import re

app = FastAPI()

# ✅ CORS (React + Production safe)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://snowlabs.onrender.com",
        "https://choose-your-sub.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "SRT Script Analyzer API is running"}

def clean_srt(text: str):
    """
    Cleans SRT metadata, timestamps, and styling tags.
    """
    # 1. Remove HTML-like styling tags (e.g., <i>, <font>)
    text = re.sub(r'<[^>]*>', '', text)
    
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        # 2. Skip SRT index numbers
        if line.isdigit():
            continue
        # 3. Skip timestamp lines
        if "-->" in line:
            continue
        cleaned.append(line)

    return " ".join(cleaned)

def analyze_text(text: str):
    """
    Performs NLP analysis on the cleaned text.
    """
    # Extract words (ignores punctuation)
    words = re.findall(r'\w+', text.lower())
    
    # Better sentence splitting (handles multiple punctuation marks)
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]

    total_words = len(words)
    unique_words = len(set(words))

    if total_words == 0:
        return {
            "word_count": 0,
            "unique_words": 0,
            "diversity": 0,
            "avg_sentence_length": 0
        }

    return {
        "word_count": total_words,
        "unique_words": unique_words,
        "diversity": round(unique_words / total_words, 3),
        "avg_sentence_length": round(total_words / max(len(sentences), 1), 2)
    }

@app.post("/compare")
async def compare(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    results = []

    for file in files:
        if not file.filename.lower().endswith(".srt"):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")

        content = await file.read()

        # Handle encoding issues (UTF-8 first, then Latin-1)
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text = content.decode("latin-1")
            except Exception:
                raise HTTPException(status_code=400, detail=f"Could not decode file: {file.filename}")

        cleaned = clean_srt(text)
        details = analyze_text(cleaned)

        results.append({
            "filename": file.filename,
            "details": details
        })

    # Prevent crash if no words were found in any files
    word_counts = [r["details"]["word_count"] for r in results]
    if not word_counts or max(word_counts) == 0:
        return {
            "mode": "none",
            "best_file": "N/A",
            "results": results
        }

    # 🔥 Decision Logic
    # If the length difference is small, focus on "Quality" (vocabulary variety)
    # If one is much longer, focus on "Richness" (amount of content)
    mode = "quality" if max(word_counts) - min(word_counts) < 200 else "richness"

    # 🔥 Scoring Algorithm
    for r in results:
        d = r["details"]

        if mode == "quality":
            # Higher weight on unique word density
            score = (d["diversity"] * 100) - (d["avg_sentence_length"] * 0.2)
            reason = "High vocabulary density and concise structure."
        else:
            # Higher weight on volume of information
            score = (d["word_count"] * 0.1) + (d["diversity"] * 50)
            reason = "More detailed content with good variety."

        r["score"] = max(0, round(score, 2)) # Ensure score isn't negative
        r["reason"] = reason

    # Sort by highest score first
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "mode": mode,
        "best_file": results[0]["filename"],
        "results": results
    }