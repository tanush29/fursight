import weaviate
import os

client = weaviate.Client(
    url="https://nkzuxybvr3ugtj22emania.c0.us-west3.gcp.weaviate.cloud",
    auth_client_secret=weaviate.auth.AuthApiKey(api_key=os.getenv("WEAVIATE_API_KEY")),
)
