from fastapi import APIRouter
from models.chat_model import ChatModel
from weather import get_weather

router = APIRouter()
chatbot = ChatModel()

@router.post("/chat-local")
async def chat(req: dict):
    message = req.get("message", "")
    location = req.get("location", "Madurai")

    tag = chatbot.predict(message)
    base_response = chatbot.get_response(tag)

    # Get weather (your existing function)
    weather = get_weather(location)

    final_response = base_response

    # Add intelligence using weather
    if weather:
        temp = weather.get("temp", 0)
        humidity = weather.get("humidity", 0)

        final_response += f"\n\n🌡 Temperature: {temp}°C"
        final_response += f"\n💧 Humidity: {humidity}%"

        if temp > 38:
            final_response += "\n⚠️ Extreme heat — avoid outdoor activity."
        elif temp > 32:
            final_response += "\n🌤 Moderate heat — stay hydrated."

    return {
        "reply": final_response,
        "tag": tag,
        "weather": weather
    }