from flask import Flask, request, jsonify
import numpy as np
from backend.weather import get_weather
from backend.model_loader import model

app = Flask(__name__)


@app.route("/")
def home():
    return "🔥 Heat Prediction Backend Running"


@app.route("/api/live", methods=["POST"])
def live_prediction():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        data = request.get_json()

        lat = data.get("lat")
        lon = data.get("lon")

        if lat is None or lon is None:
            return jsonify({"error": "Latitude and Longitude required"}), 400

        # 🌦️ Get weather (4 features)
        temp, hum, pressure, wind = get_weather(lat, lon)

        print("Temp:", temp, "Humidity:", hum, "Pressure:", pressure, "Wind:", wind)

        # 🤖 Prepare input
        input_data = np.array([[temp, hum, pressure, wind]])

        print("Model input:", input_data)

        # Predict
        result = model.predict(input_data)

        print("Model Output:", result)

        # ⚠️ Adjust based on model output
        output = result[0]

        try:
            climate = output["climate"]
            solutions = output["solutions"]
        except:
            climate = str(output)
            solutions = {}

        return jsonify({
            "temperature": temp,
            "humidity": hum,
            "pressure": pressure,
            "wind_speed": wind,
            "climate": climate,
            "solutions": solutions
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)