print("🔥 FINAL BACKEND RUNNING")

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from weather import get_weather
from model_loader import model
from api import climate_solutions, heat_advice
from chat_model import ChatModel
from chat_local import get_response
import re
chatbot = ChatModel()

app = Flask(__name__) 
CORS(app)

labels = {
    0: "Low",
    1: "Medium",
    2: "High"
}

@app.route("/")
def home():
    return "Backend Running Successfully"


# 🔥 SINGLE LOCATION (NO CHANGE)
@app.route("/api/live", methods=["POST"])
def predict_heat():

    try:
        data = request.get_json()

        lat = data.get("lat")
        lon = data.get("lon")

        if lat is None or lon is None:
            return jsonify({"error": "lat and lon required"}), 400

        temp, humidity, pressure, wind = get_weather(lat, lon)

        temp_max = temp + 1
        temp_min = temp - 1
        precip = 0

        sample = pd.DataFrame([[temp_max, temp_min, precip, wind]], columns=[
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "wind_speed_10m_max"
        ])

        prediction = model.predict(sample)[0]
        heat_risk = labels.get(prediction, "Unknown")

        avg_temp = (temp_max + temp_min) / 2

        recommendation = heat_advice.get(heat_risk, {})
        climate, climate_advice = climate_solutions(avg_temp)

        return jsonify({
            "temp": temp,
            "humidity": humidity,
            "wind": wind,
            "risk": heat_risk,
            "recommendation": recommendation,
            "climate_type": climate,
            "climate_solutions": climate_advice
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔥 NEW: GRID HEATMAP API
@app.route("/predict-all", methods=["GET"])
def predict_all():

    try:
        grid_data = []

        base_lat = 13.0827
        base_lon = 80.2707

        # 🔥 ONLY ONE WEATHER CALL (IMPORTANT)
        temp, humidity, pressure, wind = get_weather(base_lat, base_lon)

        for i in range(-10, 10):
            for j in range(-10, 10):

                lat = base_lat + (i * 0.01)
                lon = base_lon + (j * 0.01)

                temp_max = temp + 1
                temp_min = temp - 1
                precip = 0

                sample = pd.DataFrame([[temp_max, temp_min, precip, wind]], columns=[
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_sum",
                    "wind_speed_10m_max"
                ])

                prediction = model.predict(sample)[0]
                heat_risk = labels.get(prediction, "Unknown")

                # 🔥 convert to intensity
                intensity = 1 if heat_risk == "Low" else 2 if heat_risk == "Medium" else 3

                grid_data.append({
                    "lat": lat,
                    "lon": lon,
                    "intensity": intensity
                })

        return jsonify(grid_data)

    except Exception as e:
        print("❌ GRID ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        msg = data.get("message", "").lower().strip()

        # 🔥 dynamic location
        lat = data.get("lat")
        lon = data.get("lon")

        if lat is None or lon is None:
            lat = 13.0827
            lon = 80.2707

        # 🧠 intent detection (ML)
        tag = chatbot.predict(msg)
        base_response = chatbot.get_response(tag)

        # 🌦 weather
        try:
            temp, humidity, pressure, wind = get_weather(lat, lon)
        except:
            temp, humidity = None, None

        # 🧠 FINAL RESPONSE (STRICT LOGIC)
        final_response = ""

        # 🔥 TEMPERATURE (ONLY WHEN ASKED)
        if tag == "temperature":
            if temp is not None:
                final_response = f"The current temperature is {temp}°C."
            else:
                final_response = "Unable to fetch temperature."

        # 🔥 CLOTHING
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

        # 🔥 SAFETY
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

        # 🔥 HEALTH
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

        # 🔥 OPTIONAL: UHI context (ONLY for general queries)
        if tag == "general":
            final_response += "\n\n🏙 Urban areas are usually 2–5°C hotter due to the Urban Heat Island effect."

        return jsonify({
            "reply": final_response,
            "tag": tag,
            "lat": lat,
            "lon": lon
        })

    except Exception as e:
        return jsonify({
            "reply": "System working, but chatbot had an issue.",
            "error": str(e)
        })
if __name__ == "__main__":
    app.run(debug=True)