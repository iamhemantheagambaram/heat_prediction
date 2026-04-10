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
            "human_recommendations": recommendation.get("human", {}),
            "environment_recommendations": recommendation.get("environment", {})
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔥 AI CHATBOT API (FINAL CLEAN VERSION)
@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        msg = data.get("message", "").strip()
        if not msg:
            return jsonify({"reply": "Please enter a message."}), 400

        msg = msg.lower()

        # 🔥 location
        lat = data.get("lat", 13.0827)
        lon = data.get("lon", 80.2707)

        # 🧠 intent
        tag = chatbot.predict(msg)
        base_response = chatbot.get_response(tag)

        # 🌦 weather
        try:
            temp, humidity, pressure, wind = get_weather(lat, lon)
        except:
            temp, humidity, pressure, wind = None, None, None, None

        final_response = base_response

        # 🔥 SMART RESPONSE LOGIC
        if tag == "temperature" and temp is not None:
            final_response = f"{base_response} Current temperature is {temp}°C."

        elif tag == "clothing" and temp is not None:
            if temp >= 38:
                final_response = "It's very hot. Wear light cotton clothes and avoid dark colors."
            elif temp >= 32:
                final_response = "Wear breathable and light clothing. Stay hydrated."
            else:
                final_response = "Weather is comfortable. Normal clothing is fine."

        elif tag == "safety" and temp is not None:
            if temp >= 38:
                final_response = "Extreme heat. Avoid going outside during peak hours."
            elif temp >= 32:
                final_response = "Moderate heat. Limit outdoor exposure."
            else:
                final_response = "Weather is safe for outdoor activities."

        elif tag == "health" and temp is not None:
            if temp >= 38:
                final_response = "High risk of heatstroke. Stay hydrated and indoors."
            else:
                final_response = "Stay hydrated and avoid long sun exposure."

        # 🔥 UHI info
        if tag == "general":
            final_response += "\n\n🏙 Urban areas are usually 2–5°C hotter due to the Urban Heat Island effect."

        return jsonify({
            "reply": final_response,
            "tag": tag,
            "lat": lat,
            "lon": lon
        })

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
