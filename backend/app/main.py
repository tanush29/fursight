from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, transcription, todo, chat, injury

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           
    allow_credentials=True,
    allow_methods=["*"],          
    allow_headers=["*"],           
)

app.include_router(auth.router)
app.include_router(transcription.router)
app.include_router(todo.router)
app.include_router(chat.router)
app.include_router(injury.router)
