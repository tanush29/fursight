import os
import base64
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

# Initialize the Anthropic client with your API key
client = Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    # Uncomment below to override the default version if needed:
    # default_headers={"anthropic-version": os.getenv("ANTHROPIC_VERSION")}
)

def predict_injury_from_image(image_bytes: bytes) -> dict:
    """
    Sends an image to Claude Vision via the Messages API,
    instructing it to identify any animal injuries and return detailed JSON.
    """
    # Convert image to base64 for the API request
    img_b64 = base64.b64encode(image_bytes).decode("utf-8")
    
    # Use the Messages API (not Completions) for image analysis
    response = client.messages.create(
        model="claude-3-7-sonnet-20250219",  # Using the latest model
        max_tokens=500,
        temperature=0.0,  # Set to 0 for consistent JSON formatting
        system="You are an expert veterinary diagnostician specialized in identifying animal injuries from images. You MUST ALWAYS respond with properly formatted JSON only, with no additional text or explanation outside the JSON object.",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Examine this image carefully for any animal injuries. Respond ONLY with a valid JSON object using these keys:\n\n- injury: The specific type of injury you observe (e.g., 'laceration', 'fracture', 'bite wound') or 'none' if no injury is visible\n- severity: Either 'low', 'moderate', 'high', or 'none'\n- confidence: A number between 0.0 and 1.0 indicating your confidence level\n- description: A brief (2-3 sentence) description of what you see that indicates injury or why you believe there is no injury\n\nYour entire response must be ONLY the JSON object with no additional text or explanation before or after. Format your response correctly as a JSON object with the exact keys listed above."
                    },
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",  # Adjust based on your image type
                            "data": img_b64
                        }
                    }
                ]
            }
        ]
    )
    
    # Extract and parse the JSON response
    try:
        response_text = response.content[0].text.strip()
        
        # Sometimes Claude might add markdown code fences - remove them if present
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "", 1)
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()
        
        # Try to parse the JSON
        result = json.loads(response_text)
        
        # Ensure all required fields are present with defaults if missing
        if "injury" not in result:
            result["injury"] = "none"
        if "severity" not in result:
            result["severity"] = "none"
        if "confidence" not in result:
            result["confidence"] = 0.0
        if "description" not in result:
            result["description"] = "No detailed description provided."
            
        return result
    except (json.JSONDecodeError, IndexError, AttributeError) as e:
        return {
            "error": f"Failed to parse response: {str(e)}",
            "raw_response": response_text if 'response_text' in locals() else "No response text",
            "injury": "none",
            "severity": "none",
            "confidence": 0.0,
            "description": "Unable to analyze image due to a processing error."
        }
    
    # Extract and parse the JSON response
    try:
        return json.loads(response.content[0].text)
    except (json.JSONDecodeError, IndexError, AttributeError) as e:
        return {
            "error": f"Failed to parse response: {str(e)}",
            "raw_response": response.content[0].text if response.content else "No content"
        }