from fastapi import APIRouter
from models.chat_model import ChatModel
from weather import get_weather

router = APIRouter()
chatbot = ChatModel()


@router.post("/chat-local")
async def chat(req: dict):
    message = req.get("message", "").lower()
    location = req.get("location", "Madurai")

    # 🧠 Step 1: Detect intent using your model
    tag = chatbot.predict(message)
    base_response = chatbot.get_response(tag)

    # 🌦 Step 2: Get weather (dynamic data)
    weather = get_weather(location)

    temp = None
    humidity = None

    if weather:
        temp = weather.get("temp", 0)
        humidity = weather.get("humidity", 0)

    # 🧠 Step 3: THINK → modify response based on intent
    final_response = ""

    # 🔥 TEMPERATURE INTENT
    if tag == "temperature":
        if temp is not None:
            final_response = f"The current temperature in {location} is {temp}°C."
        else:
            final_response = "Unable to fetch temperature right now."

    # 🔥 CLOTHING INTENT
    elif tag == "clothing":
        if temp is not None:
            if temp >= 38:
                final_response = "It's very hot. Wear light cotton clothes and avoid dark colors."
            elif temp >= 32:
                final_response = "Wear breathable and light clothing. Stay hydrated."
            else:
                final_response = "Weather is comfortable. Normal clothing is fine."
        else:
            final_response = base_response

    # 🔥 SAFETY INTENT
    elif tag == "safety":
        if temp is not None:
            if temp >= 38:
                final_response = "Extreme heat. Avoid going outside during peak hours."
            elif temp >= 32:
                final_response = "Moderate heat. Limit outdoor exposure."
            else:
                final_response = "Weather is safe for outdoor activities."
        else:
            final_response = base_response

    # 🔥 HEALTH INTENT
    elif tag == "health":
        if temp is not None:
            if temp >= 38:
                final_response = "High risk of heatstroke. Stay hydrated and indoors."
            else:
                final_response = "Stay hydrated and avoid long sun exposure."
        else:
            final_response = base_response

    # 🔥 GENERAL / FALLBACK
    else:
        final_response = base_response

    # ❌ IMPORTANT: NO automatic temperature dump

    return {
        "reply": final_response,
        "tag": tag
    }