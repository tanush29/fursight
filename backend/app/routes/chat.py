# app/routes/chat.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import os
import smtplib
from email.message import EmailMessage

from openai import OpenAI
from dotenv import load_dotenv

from weaviate import connect_to_weaviate_cloud
from weaviate.auth import AuthApiKey

# Load environment variables
load_dotenv(override=True)

# Gmail credentials
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")
DOCTOR_EMAIL = "tanush29@gmail.com"

# Initialize OpenAI client (v1.x SDK)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Weaviate client
weaviate_client = connect_to_weaviate_cloud(
    cluster_url      = os.getenv("WEAVIATE_URL"),
    auth_credentials = AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    headers          = {"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")}
)

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    patient_id: str
    question: str

class ChatResponse(BaseModel):
    reply: str
    critical: bool = False

# Keywords indicating urgent/critical issues
CRITICAL_KEYWORDS = {
    "urgent","emergency","bleeding","seizure","choke",
    "breath","unconscious","collapse","pain","fracture"
}

# In-memory session state: 
# { session_id: {"asked_notify": bool, "original_question": str} }
session_state: Dict[str, Dict[str, Optional[str]]] = {}

def is_critical(text: str) -> bool:
    lower = text.lower()
    return any(word in lower for word in CRITICAL_KEYWORDS)

def notify_doctor(session_id: str, question: str):
    """
    Sends an email notification to the doctor via Gmail SMTP.
    """
    if not GMAIL_USER or not GMAIL_PASSWORD:
        print("[Notify Doctor] Missing Gmail credentials, cannot send email.")
        return

    msg = EmailMessage()
    msg["Subject"] = f"URGENT: Veterinary alert (session {session_id})"
    msg["From"] = GMAIL_USER
    msg["To"] = DOCTOR_EMAIL
    msg.set_content(
        f"You have a critical veterinary alert from patient session {session_id}:\n\n"
        f"{question}\n\n"
        "Please attend to this immediately."
    )

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(GMAIL_USER, GMAIL_PASSWORD)
            smtp.send_message(msg)
        print(f"[Notify Doctor] Email sent to {DOCTOR_EMAIL} for session {session_id}")
    except Exception as e:
        print(f"[Notify Doctor] Failed to send email: {e}")

def fetch_context(patient_id: str, question: str, limit: int = 5) -> str:
    coll = weaviate_client.collections.get("MedicalNote")
    resp = coll.query.near_text(
        query=question,
        limit=limit * 3
    )
    # Filter results to this patient
    filtered = [
        obj for obj in resp.objects
        if obj.properties.get("patient_id") == patient_id
    ]
    contents = [o.properties["content"] for o in filtered[:limit]]
    return "\n\n".join(contents)

def call_gpt(context: str, question: str) -> str:
    system = (
        "You are a veterinary AI assistant. Answer *only* pet health care questions "
        "using the patient’s prior visit notes. "
        "If asked anything else, reply: "
        "'I’m sorry, I can only help with pet health care questions.'"
    )
    user_msg = f"Context:\n{context}\n\nQuestion:\n{question}"
    try:
        resp = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user_msg}
            ],
            temperature=0.2
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    return resp.choices[0].message.content.strip()

def is_affirmative(reply: str) -> bool:
    """
    Use GPT to classify the user’s short reply as 'yes' or 'no'.
    Returns True only if the response starts with 'yes'.
    """
    prompt = (
        "You are a strict yes/no classifier. "
        "Reply with exactly 'yes' or 'no'. If the user types anything positive it means yes and if negative it means no.\n\n"
        f"User reply: \"{reply}\""
    )
    try:
        resp = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role":"user","content":prompt}],
            temperature=0
        )
    except Exception:
        # Fallback: treat anything containing 'y' as yes
        return "y" in reply.lower()
    ans = resp.choices[0].message.content.strip().lower()
    return ans.startswith("yes")

@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    sid = req.session_id
    user_q = req.question.strip()

    # --- Step 1: If we previously asked "notify your doctor?", interpret yes/no ---
    state = session_state.get(sid)
    if state and state.get("asked_notify"):
        if is_affirmative(user_q):
            notify_doctor(sid, state["original_question"])
            session_state.pop(sid, None)
            return {"reply": "Alright, your doctor has been notified.", "critical": False}
        else:
            orig_q = state["original_question"]
            session_state.pop(sid, None)
            ctx = fetch_context(req.patient_id, orig_q)
            answer = call_gpt(ctx, orig_q)
            return {"reply": answer, "critical": False}

    # --- Step 2: Detect a new critical question ---
    if is_critical(user_q):
        session_state[sid] = {
            "asked_notify": True,
            "original_question": user_q
        }
        return {
            "reply": "This sounds urgent. Would you like me to notify your doctor?",
            "critical": True
        }

    # --- Step 3: Normal, non-critical question → answer via GPT immediately ---
    ctx = fetch_context(req.patient_id, user_q)
    answer = call_gpt(ctx, user_q)
    return {"reply": answer, "critical": False}
