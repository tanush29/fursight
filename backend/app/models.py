from pydantic import BaseModel, EmailStr
from pydantic import BaseModel
from typing import Optional

class UserSignup(BaseModel):
    role: str  # "doctor" or "patient"
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TranscriptionSession(BaseModel):
    session_id: str
    doctor_id: Optional[str]
    patient_id: Optional[str]
    transcription: str