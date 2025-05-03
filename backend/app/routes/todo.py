from fastapi import APIRouter
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from app.services.gpt_client import generate_updated_todo

router = APIRouter()
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client["fursight"]
chat_collection = db["transcriptions"]

@router.post("/generate-todo")
def generate_todo(patient_id: str, past_todo: str):
    latest_transcription = chat_collection.find_one(
        {"patient_id": patient_id},
        sort=[("timestamp", -1)]
    )

    if not latest_transcription:
        return {"success": False, "message": "No transcription found for this patient"}

    updated_todo = generate_updated_todo(
        transcribed_text=latest_transcription["transcription"],
        past_todo=past_todo
    )

    return {
        "success": True,
        "updated_todo": updated_todo
    }
