print("🔥 FINAL BACKEND RUNNING")

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from weather import get_weather
from model_loader import model
from api import heat_recommendations
from chat_model import ChatModel

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

        recommendation = heat_recommendations.get(heat_risk, {})
        
        return jsonify({
            "temp": temp,
            "humidity": humidity,
            "wind": wind,
            "risk": heat_risk,
            "recommendation": recommendation
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/heatmap", methods=["POST"])
def heatmap():
    data = request.get_json()
    lat = data["lat"]
    lon = data["lon"]

    points = [
        {"lat": lat, "lon": lon, "temp": 35},
        {"lat": lat + 0.01, "lon": lon + 0.01, "temp": 37},
        {"lat": lat - 0.01, "lon": lon - 0.01, "temp": 32}
    ]

    return jsonify(points)


# 🔥 GRID HEATMAP API
@app.route("/predict-all", methods=["GET"])
def predict_all():
    try:
        grid_data = []
        base_lat = 13.0827
        base_lon = 80.2707

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
    
@app.route("/predict_heat", methods=["POST"])
def predict_heat_recommendation():
    try:
        data = request.get_json()

        temp_max = data.get("temperature_2m_max")
        temp_min = data.get("temperature_2m_min")
        wind = data.get("wind_speed_10m_max")

        sample = pd.DataFrame([[temp_max, temp_min, 0, wind]], columns=[
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "wind_speed_10m_max"
        ])

        prediction = model.predict(sample)[0]
        heat_risk = labels.get(prediction, "Unknown")

        recommendation = heat_recommendations.get(heat_risk, {})

        return jsonify({
            "heat_risk": heat_risk,
            "human_recommendations": recommendation.get("human_recommendations", {}),
            "environment_recommendations": recommendation.get("environment_recommendations", {})
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔥 AI CHATBOT API (FINAL CLEAN VERSION)
# 🔥 AI CHATBOT API (UPGRADED WITH TAMIL SUPPORT)
@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        msg = data.get("message", "").strip()
        language = data.get("language", "en")

        if not msg:
            return jsonify({"reply": "Please enter a message."}), 400

        msg_lower = msg.lower()

        lat = data.get("lat", 13.0827)
        lon = data.get("lon", 80.2707)

        tag = chatbot.predict(msg_lower)
        base_response = chatbot.get_response(tag, language)

        try:
            temp, humidity, pressure, wind = get_weather(lat, lon)
        except:
            temp, humidity, pressure, wind = None, None, None, None

        # ================= ENGLISH =================
        if language == "en":

            if tag == "clothing" and temp:
                if temp >= 38:
                    reply = "🔥 It's very hot. Wear light cotton clothes and avoid dark colors."
                elif temp >= 32:
                    reply = "🌤 Wear breathable clothes and stay hydrated."
                else:
                    reply = "😊 Weather is comfortable. Normal clothing is fine."

            elif tag == "heat_risk" and temp:
                if temp >= 38:
                    reply = "⚠️ Extreme heat. Avoid going outside between 12–3 PM."
                elif temp >= 32:
                    reply = "🌤 Moderate heat. Limit outdoor exposure."
                else:
                    reply = "✅ Safe weather for outdoor activities."

            elif tag == "hydration":
                reply = "💧 Drink water regularly. At least 3–4 liters in hot weather."

            elif tag == "uhi":
                reply = "Concrete traps heat in cities, Plant Trees around your surroundings to reduce heat and also use Cool roofings."

            else:
                reply = base_response

            if temp:
                reply += f"\n🌡 Current temperature: {temp}°C"

        # ================= TAMIL =================
        elif language == "ta":

            if tag == "clothing" and temp:
                if temp >= 38:
                    reply = "🔥 மிகவும் சூடாக உள்ளது. லைட் காட்ன் உடைகள் அணியுங்கள்."
                elif temp >= 32:
                    reply = "🌤 இலகுரக உடைகள் அணிந்து, தண்ணீர் குடிக்கவும்."
                else:
                    reply = "😊 வானிலை சீராக உள்ளது."

            elif tag == "heat_risk" and temp:
                if temp >= 38:
                    reply = "⚠️ அதிக வெப்பம். மதியம் 12–3 வரை வெளியே செல்ல வேண்டாம்."
                elif temp >= 32:
                    reply = "🌤 மிதமான வெப்பம். வெளியே செல்லும்போது கவனம்."
                else:
                    reply = "✅ பாதுகாப்பான வானிலை."

            elif tag == "hydration":
                reply = "💧 அதிக தண்ணீர் குடிக்கவும். வெப்பத்தில் உடலை குளிர்விக்க உதவும்."

            elif tag == "uhi":
                reply = "🏙 நகரங்களில் மரங்கள் குறைவாக இருப்பதால் வெப்பம் அதிகரிக்கும், கான்கிரீட் வெப்பத்தை தக்கவைத்து நகரங்களை சூடாக்குகிறது."

            else:
                reply = "நான் வெப்பம், வானிலை மற்றும் பாதுகாப்பு குறித்து உதவ முடியும்."

            if temp:
                reply += f"\n🌡 தற்போதைய வெப்பநிலை: {temp}°C"

        return jsonify({"reply": reply})

    except Exception as e:
        print("CHAT ERROR:", e)
        return jsonify({"reply": "Something went wrong."}), 500


# 🔥 NEW: 5 DAY HEAT TREND API (ONLY FIXED POSITION)
@app.route("/api/heat-trend", methods=["POST"])
def heat_trend():
    try:
        data = request.get_json()
        lat = data.get("lat")
        lon = data.get("lon")

        if lat is None or lon is None:
            return jsonify({"error": "lat and lon required"}), 400

        trend_data = []
        temp, humidity, pressure, wind = get_weather(lat, lon)

        for day in range(1, 6):
            temp_future = temp + (day * 0.8)
            temp_max = temp_future + 1
            temp_min = temp_future - 1
            precip = 0

            sample = pd.DataFrame([[temp_max, temp_min, precip, wind]], columns=[
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "wind_speed_10m_max"
            ])

            prediction = model.predict(sample)[0]
            heat_risk = labels.get(prediction, "Unknown")

            trend_data.append({
                "day": f"Day {day}",
                "temperature": round(temp_future, 2),
                "risk": heat_risk
            })

        return jsonify(trend_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
