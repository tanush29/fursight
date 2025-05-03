# app/routes/booking_agent.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.websocket("/ws/booking-agent")
async def booking_agent_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        # Step 1: Receive initial form values from frontend
        init_data = await websocket.receive_json()
        hospital = init_data.get("hospital")
        department = init_data.get("department")
        doctor = init_data.get("doctor")

        system_prompt = (
            "You are a friendly and professional receptionist at a veterinary hospital, receiving a call from a pet owner looking to schedule an appointment. "
        "Speak clearly and conversationally, guide the pet owner through available time slots, and confirm details like pet name, reason for visit, and preferred doctor if {doctor} if needed. "
        "Be empathetic and helpful. If the time mentioned is unavailable, suggest alternatives. "
        "Start with 'Hello, thank you for calling {department} department at {hospital}, how can I help you today?' "
        "The conversation ends once you say 'appointment confirmed'."
        )

        messages = [{"role": "system", "content": system_prompt}]
        await websocket.send_text(" Ring Ring Ring...Hello")

        while True:
            # Step 2: Receive microphone input text from frontend
            msg = await websocket.receive_text()
            if "bye" in msg.lower():
                await websocket.send_text("No worries! Have a great day! Ending call.")
                break

            messages.append({"role": "user", "content": msg})
            chat = client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.6
            )
            reply = chat.choices[0].message.content
            messages.append({"role": "assistant", "content": reply})
            await websocket.send_text(f" {reply}")

    except WebSocketDisconnect:
        print("WebSocket disconnected.")
