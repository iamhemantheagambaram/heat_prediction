print("🔥 FINAL BACKEND RUNNING")

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

from weather import get_weather
from model_loader import model
from api import climate_solutions, heat_advice

app = Flask(__name__)
CORS(app)  # ✅ Allow frontend requests


# 🔹 Heat labels (ML output → readable)
labels = {
    0: "Low",
    1: "Medium",
    2: "High"
}

# 🏠 HOME ROUTE
@app.route("/")
def home():
    return "Backend Running Successfully"


# 🔥 MAIN API (Frontend → Backend → Weather → ML → Response)
@app.route("/api/live", methods=["POST"])
def predict_heat():

    try:
        data = request.get_json()
        print("📍 Received request:", data)

        lat = data.get("lat")
        lon = data.get("lon")

        if lat is None or lon is None:
            return jsonify({"error": "lat and lon required"}), 400

        print(f"📍 Location: lat={lat}, lon={lon}")

        # 🌦️ Step 1: Get real-time weather
        temp, humidity, pressure, wind = get_weather(lat, lon)

        print(f"🌡 Weather → Temp: {temp}, Humidity: {humidity}, Wind: {wind}")

        # 🔧 Step 2: Prepare ML input
        temp_max = temp + 1
        temp_min = temp - 1
        precip = 0

        sample = pd.DataFrame([[temp_max, temp_min, precip, wind]], columns=[
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "wind_speed_10m_max"
        ])

        print("📊 Model input:", sample)

        # 🔮 Step 3: ML Prediction
        prediction = model.predict(sample)[0]
        heat_risk = labels.get(prediction, "Unknown")

        print("🔥 Prediction:", heat_risk)

# 🌡 Step 4: Climate-based logic
        avg_temp = (temp_max + temp_min) / 2

# ✅ GET recommendation from api.py (IMPORTANT)
        recommendation = heat_advice.get(heat_risk, {})

# Optional: climate info
        climate, climate_advice = climate_solutions(avg_temp)

        # 📤 Final response
        response = {
            "temp": temp,
            "humidity": humidity,
            "wind": wind,
            "risk": heat_risk,
            "recommendation": recommendation,
            "climate_type": climate,
            "climate_solutions": climate_advice
        }

        print("✅ Sending response:", response)

        return jsonify(response)

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


# 🗺️ HEATMAP API (dummy for now)
@app.route("/api/heatmap/<city>")
def heatmap(city):

    data = [
        {"lat": 13.085, "lon": 80.210, "risk": "High"},
        {"lat": 13.041, "lon": 80.234, "risk": "Medium"},
        {"lat": 12.981, "lon": 80.220, "risk": "Low"}
    ]

    return jsonify(data)


# 💬 CHATBOT API
@app.route("/api/chat", methods=["POST"])
def chat():

    msg = request.json.get("message", "").lower()

    if "heat" in msg:
        return jsonify({"reply": "Heat is high. Stay hydrated and avoid sun."})

    if "safe time" in msg:
        return jsonify({"reply": "Avoid outdoor activity between 11 AM and 4 PM."})

    return jsonify({"reply": "Ask about heat, safety, or climate."})


# ▶️ RUN SERVER
if __name__ == "__main__":
    app.run(debug=True)