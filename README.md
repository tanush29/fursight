# 🐾 TailMate – Your AI-Powered Veterinary Assistant

TailMate is an intelligent, voice-first veterinary assistant that revolutionizes pet healthcare by combining real-time transcription, visualizations, voice+text AI chat, and computer vision to deliver a full-stack clinical experience—right from your pocket.

---

## 🚀 Features

- 🔒 **Secure Sign-Up/Login** for pet owners and doctors
- 🎤 **Live Transcription** of doctor-pet owner conversations using Web Speech API and NFC-like proximity detection
- 🧠 **AI Chat Agent** for patients and doctors (context-aware, powered by GPT & Claude)
- 📊 **Data Visualization** via natural language chart queries
- 📅 **Appointments Dashboard** with dynamic, real-time additions from AI booking agents
- ✅ **To-Do List** that updates from live conversations
- 📞 **AI Phone Booking Agent** to simulate real calls with hospitals
- 🐶 **Injury Detection** using computer vision from uploaded images
- 🧬 **Vectorized Context Storage** in Weaviate for intelligent memory and retrieval

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Ant Design Mobile
- **Backend**: FastAPI (Python)
- **LLMs**: OpenAI GPT + Anthropic Claude
- **ASR & TTS**: Web Speech API
- **Vector DB**: Weaviate
- **Transcription Trigger**: NFC-style simulated proximity
- **Image Analysis**: Custom Computer Vision (via FastAPI route)

---

## 🧰 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tailmate.git
cd tailmate
```

### 2. Start the Frontend

```
cd vetiq-nexus-demo
npm install
npm run dev
```

### 3. Start the backend

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
### 4. Create a weaviate cluster

Go to Weaviate's website and create a cluster and get the enivronment variables.

### 5. Create a .env file with these values

```
OPENAI_API_KEY=
WEAVIATE_API_KEY=
WEAVIATE_HTTP_HOST=
WEAVIATE_GRPC_HOST=
WEAVIATE_URL=
ANTHROPIC_API_KEY=
ANTHROPIC_VERSION=
GMAIL_USER=
GMAIL_PASSWORD=
```


## How to use

Sign Up/Login as doctor or patient

Go to Transcribe tab to start live transcription of conversations

Visit Dashboard to view appointments, tasks, and charts

Try Chat tab to ask questions via text or voice

Use Book via Agent to simulate a call with an AI receptionist

Upload pet injury images to get AI-powered diagnosis
