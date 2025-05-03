from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from app.services.anthropic_client import predict_injury_from_image

router = APIRouter(prefix="/injury", tags=["injury"])

class InjuryResponse(BaseModel):
    injury: str = Field(description="Type of injury detected or 'none'")
    severity: str = Field(description="Severity level: 'low', 'moderate', 'high', or 'none'")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0", ge=0.0, le=1.0)
    description: str = Field(description="Brief description of the observed injury or explanation of why no injury is detected")

@router.post("/predict", response_model=InjuryResponse)
async def predict_injury(file: UploadFile = File(...)):
    """
    Analyze an uploaded image to detect animal injuries.
    Returns injury type, severity, and confidence score.
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type; must be image/*")
    
    # Read image bytes
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    # Process with Claude Vision
    try:
        result = predict_injury_from_image(image_bytes)
        
        # Check for error key in response
        if "error" in result:
            raise HTTPException(status_code=502, detail=f"Model error: {result['error']}")
            
        # Validate the required fields are present
        required_fields = ["injury", "severity", "confidence", "description"]
        if not all(field in result for field in required_fields):
            missing = [f for f in required_fields if f not in result]
            raise HTTPException(
                status_code=502, 
                detail=f"Model response missing required fields: {', '.join(missing)}"
            )
            
        # Validate severity values
        valid_severities = ["low", "moderate", "high", "none"]
        if result["severity"] not in valid_severities:
            result["severity"] = "none"  # Default to safe value
            
        # Ensure confidence is a float between 0 and 1
        try:
            result["confidence"] = float(result["confidence"])
            if not 0 <= result["confidence"] <= 1:
                result["confidence"] = max(0, min(result["confidence"], 1))  # Clamp to [0,1]
        except (TypeError, ValueError):
            result["confidence"] = 0.0  # Default if parsing fails
            
        # Ensure description exists and is not empty
        if "description" not in result or not result["description"]:
            if result["injury"] == "none":
                result["description"] = "No visible injuries detected in the image."
            else:
                result["description"] = f"A {result['severity']} {result['injury']} was detected."
        
        return result
        
    except ValueError:
        raise HTTPException(status_code=502, detail="Model did not return valid JSON")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Inference error: {str(e)}")