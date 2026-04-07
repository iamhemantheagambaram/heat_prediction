from flask import Blueprint, request, jsonify
from backend.weather import get_weather
from backend.model_loader import model

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/api/live', methods=['POST'])
def live_prediction():
    data = request.json

    lat = data.get('lat')
    lon = data.get('lon')

    if lat is None or lon is None:
        return jsonify({"error": "Missing latitude or longitude"}), 400

    # 🌦️ Get weather
    temp, humidity = get_weather(lat, lon)

    # 🤖 Model prediction
    result = model.predict([[temp, humidity]])

    print("Model Output:", result)

    # ⚠️ Adjust if needed after testing
    output = result[0]

    climate = output["climate"]
    solutions = output["solutions"]

    return jsonify({
        "temperature": temp,
        "humidity": humidity,
        "climate": climate,
        "solutions": solutions
    })