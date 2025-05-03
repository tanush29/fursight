import os
import openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_updated_todo(transcribed_text, past_todo):
    prompt = f"""You are a helpful AI assistant that updates veterinary medical to-do lists.
Here is the previous to-do list: 
{past_todo}

Here is the new transcription of the session:
{transcribed_text}

Based on this, generate the updated to-do list:"""

    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()
