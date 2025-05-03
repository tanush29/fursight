from fastapi import FastAPI
from app.routes import auth, transcription, todo, chat

app = FastAPI()

app.include_router(auth.router)
app.include_router(transcription.router)
app.include_router(todo.router)
app.include_router(chat.router)
