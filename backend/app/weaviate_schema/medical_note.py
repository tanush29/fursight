import weaviate
import weaviate.classes as wvc
from weaviate.auth import AuthApiKey
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to your Weaviate instance

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")}
)

# Define the collection schema
def create_medical_note_class():
    if not client.collections.exists("MedicalNote"):
        client.collections.create(
            name="MedicalNote",
            properties=[
                wvc.config.Property(name="patient_id", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(name="doctor_id", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(name="content", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(name="timestamp", data_type=wvc.config.DataType.DATE)
            ],
            vectorizer_config=wvc.config.Configure.Vectorizer.text2vec_openai()
        )

create_medical_note_class()
