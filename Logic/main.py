from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import re

app = FastAPI()

# ✅ CORS (React + Production safe)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change later to your Render URL if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "SRT Script Analyzer API is running"}

# 🎬 Clean SRT
def clean_srt(text):
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.isdigit():
            continue
        if "-->" in line:
            continue
        cleaned.append(line)

    return " ".join(cleaned)

# 🧠 Analyze text
def analyze_text(text):
    words = re.findall(r'\w+', text.lower())
    sentences = re.split(r'[.!?]+', text)

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

# 📂 Compare SRT files
@app.post("/compare")
async def compare(files: List[UploadFile] = File(...)):

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    results = []

    for file in files:

        if not file.filename.endswith(".srt"):
            raise HTTPException(status_code=400, detail=f"Invalid file: {file.filename}")

        content = await file.read()

        try:
            text = content.decode("utf-8")
        except:
            text = content.decode("latin-1")

        cleaned = clean_srt(text)
        details = analyze_text(cleaned)

        results.append({
            "filename": file.filename,
            "details": details
        })

    # 🔥 Decide mode
    word_counts = [r["details"]["word_count"] for r in results]

    mode = "quality" if max(word_counts) - min(word_counts) < 200 else "richness"

    # 🔥 Scoring
    for r in results:
        d = r["details"]

        if mode == "quality":
            score = d["diversity"] * 100 - d["avg_sentence_length"] * 0.5
            reason = "Best quality (diversity + structure)"
        else:
            score = d["word_count"] * 0.5 + d["diversity"] * 50
            reason = "Best richness (content + diversity)"

        r["score"] = round(score, 2)
        r["reason"] = reason

    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "mode": mode,
        "best_file": results[0]["filename"],
        "results": results
    }