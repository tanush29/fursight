from fastapi import APIRouter, UploadFile, Form
from app.db import chat_collection
from datetime import datetime
import whisper
import uuid
import os
from app.models import TranscriptionSession
from app.db import chat_collection
from datetime import datetime

from weaviate import connect_to_weaviate_cloud
from weaviate.auth import AuthApiKey
import os
from dotenv import load_dotenv

load_dotenv()  # make sure this runs once in your app startup

weaviate_client = connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")}
)

router = APIRouter()
model = whisper.load_model("base")  # Or use "small", "medium" for better accuracy

@router.post("/transcribe-audio")
async def transcribe_audio(
    audio_file: UploadFile,
    session_id: str = Form(...),
    doctor_id: str = Form(None),
    patient_id: str = Form(None)
):
    filename = f"temp_{uuid.uuid4()}.mp3"
    with open(filename, "wb") as f:
        f.write(await audio_file.read())

    result = model.transcribe(filename)
    os.remove(filename)

    record = {
        "session_id": session_id,
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "transcription": result["text"],
        "timestamp": datetime.utcnow()
    }

    chat_collection.insert_one(record)
    push_to_weaviate(record)
    return {"success": True, "transcription": result["text"]}

@router.post("/transcribe")
def save_transcription(session: TranscriptionSession):
    record = {
        "session_id": session.session_id,
        "doctor_id": session.doctor_id,
        "patient_id": session.patient_id,
        "transcription": session.transcription,
        "timestamp": datetime.utcnow()
    }
    chat_collection.insert_one(record)
    push_to_weaviate(record)
    return {"success": True, "message": "Full session transcription saved"}

def push_to_weaviate(record: dict):
    """
    record keys must match your Weaviate schema:
      - patient_id, doctor_id, session_id, content, timestamp
    """
    # transform keys if your class uses different property names
    obj = {
        "patient_id": record["patient_id"],
        "doctor_id": record["doctor_id"],
        "content":   record["transcription"],
        "session_id": record["session_id"],
        "timestamp":  record["timestamp"].replace(microsecond=0).isoformat() + "Z"
    }
    collection = weaviate_client.collections.get("MedicalNote")
    uuid = collection.data.insert(obj)
    return uuid

    

