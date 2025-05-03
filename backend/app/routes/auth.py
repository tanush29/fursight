from fastapi import APIRouter
from app.models import UserSignup, UserLogin
import json, os
from fastapi import APIRouter
from app.models import TranscriptionSession
from app.db import chat_collection
from datetime import datetime

router = APIRouter()

DB_PATH = "app/storage/users.json"

def load_users():
    if not os.path.exists(DB_PATH):
        return []
    with open(DB_PATH, "r") as f:
        return json.load(f)

def save_users(users):
    with open(DB_PATH, "w") as f:
        json.dump(users, f, indent=2)

@router.post("/signup")
def signup(user: UserSignup):
    users = load_users()
    
    if any(u["email"] == user.email for u in users):
        return {"success": False, "message": "User already exists"}

    users.append(user.dict())
    save_users(users)
    
    return {"success": True, "message": "Signup successful", "user": user.dict()}

@router.post("/login")
def login(user: UserLogin):
    users = load_users()
    for u in users:
        if u["email"] == user.email and u["password"] == user.password:
            return {
                "success": True,
                "message": "Login successful",
                "user": {
                    "name": u["name"],
                    "email": u["email"],
                    "role": u["role"]
                }
            }

    return {"success": False, "message": "Invalid email or password"}


