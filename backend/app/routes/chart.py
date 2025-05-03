# app/routes/chart.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from weaviate import connect_to_weaviate_cloud
from weaviate.auth import AuthApiKey
import os
import json

load_dotenv()

# OpenAI client (v1.x SDK)
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Weaviate client
weaviate_client = connect_to_weaviate_cloud(
    cluster_url      = os.getenv("WEAVIATE_URL"),
    auth_credentials = AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    headers          = {"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
)

router = APIRouter()

def fetch_context(patient_id: str, question: str, limit: int = 5) -> str:
    coll = weaviate_client.collections.get("MedicalNote")
    resp = coll.query.near_text(query=question, limit=limit*3)
    filtered = [o for o in resp.objects if o.properties.get("patient_id") == patient_id]
    return "\n\n".join(o.properties["content"] for o in filtered[:limit])

class ChartQueryRequest(BaseModel):
    patient_id: str
    question:    str

class ChartData(BaseModel):
    type:   str         # one of: "line", "bar", "pie"
    title:  str
    labels: list[str]
    values: list[float]

class ChartQueryResponse(BaseModel):
    reply: str
    chart: ChartData

@router.post("/chart-query", response_model=ChartQueryResponse)
def chart_query(req: ChartQueryRequest):
    # 1) gather context
    context = fetch_context(req.patient_id, req.question)

    # 2) prompt GPT for JSON output
    system_prompt = (
        "You are an API that returns JSON only. "
        "The JSON must include exactly two keys: "
        "'reply' (a short textual answer) and 'chart' (an object). "
        "The 'chart' object must have: "
        "'type' (one of 'line','bar','pie'), "
        "'title', 'labels' (array of strings), and 'values' (array of numbers). "
        "Do not output anything else. "
        "If the question is quantitative, pick an appropriate chart type; "
        "otherwise set 'chart.labels' and 'chart.values' empty."
        f"\n\nContext:\n{context}"
    )
    user_prompt = f"Question: {req.question}"

    try:
        resp = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role":"system", "content": system_prompt},
                {"role":"user",   "content": user_prompt}
            ],
            temperature=0.2
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    raw = resp.choices[0].message.content.strip()
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON from model")

    if "reply" not in obj or "chart" not in obj:
        raise HTTPException(status_code=500, detail="Missing keys in JSON")

    return obj
