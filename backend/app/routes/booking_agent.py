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
        date = init_data.get("date")
        time = init_data.get("time")
        reason = init_data.get("reason")

        system_prompt = (
            "You are an AI assistant calling a vet hospital to book an appointment "
            "on behalf of a pet owner. Sound friendly, confident, and conversational. "
            f"The requested time is {time} on {date} for the reason: {reason}. "
            "Start with 'Hi, I'm calling to book an appointment for my pet...'. "
            "The conversation ends once the person confirms with 'appointment confirmed'."
        )

        messages = [{"role": "system", "content": system_prompt}]
        await websocket.send_text(" Hi, I'm calling to book an appointment...")

        while True:
            # Step 2: Receive microphone input text from frontend
            msg = await websocket.receive_text()
            if "appointment confirmed" in msg.lower():
                await websocket.send_text("Got it! Appointment is confirmed. Ending call.")
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
