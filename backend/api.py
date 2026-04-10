print("NEW API VERSION RUNNING")

from flask import Flask, request, jsonify
import pickle
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 🔥 go ONE LEVEL UP (to heat_prediction/)
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "heat_model.pkl")

# 🔥 convert to absolute path (important)
MODEL_PATH = os.path.abspath(MODEL_PATH)

print("MODEL PATH:", MODEL_PATH)  # optional debug

model = pickle.load(open(MODEL_PATH, "rb"))

# Create Flask app
app = Flask(__name__)

# Heat risk labels
labels = {
    0: "Low",
    1: "Medium",
    2: "High"
}

# Recommendations based on heat risk
heat_recommendations = {

    "Low": {

        "human_recommendations": {
            "clothing": "Wear light casual clothes and comfortable footwear.",
            "hydration": "Drink water regularly even if you are not thirsty.",
            "food": "Eat fresh fruits like banana, apple, and orange.",
            "sun_protection": "Light sunscreen is recommended if outdoors for long time.",
            "activity": "Outdoor activities are safe throughout the day."
        },

        "environment_recommendations": {
            "trees": "Plant trees around homes and communities.",
            "ventilation": "Keep windows open for natural ventilation.",
            "energy": "Use natural lighting and reduce unnecessary electricity use.",
            "gardening": "Maintain plants and small gardens to improve cooling."
        }
    },

    "Medium": {

        "human_recommendations": {
            "clothing": "Wear light cotton clothes and use caps or hats.",
            "hydration": "Drink water every 30–45 minutes.",
            "food": "Eat cooling foods like watermelon, cucumber, curd, and citrus fruits.",
            "sun_protection": "Apply sunscreen and wear sunglasses when outside.",
            "activity": "Avoid outdoor activities between 12 PM and 3 PM.",
            "drinks": "Drink tender coconut water or fresh fruit juices."
        },

        "environment_recommendations": {
            "trees": "Increase tree plantation in urban areas.",
            "cool_roofs": "Use reflective paint or cool roof materials.",
            "transport": "Reduce vehicle use during hot hours.",
            "water_bodies": "Maintain ponds and water bodies to cool surroundings."
        }
    },

    "High": {

        "human_recommendations": {
            "clothing": "Wear breathable cotton clothes, caps, and sunglasses.",
            "hydration": "Drink water every 20–30 minutes.",
            "food": "Eat cooling foods like cucumber, watermelon, curd, and coconut water.",
            "sun_protection": "Use strong sunscreen and avoid direct sunlight.",
            "activity": "Avoid going outside between 11 AM and 4 PM.",
            "health": "Watch for symptoms like dizziness, fatigue, or dehydration.",
            "drinks": "Drink tender coconut water, buttermilk, or lemon water."
        },

        "environment_recommendations": {
            "trees": "Plant more trees and protect green spaces.",
            "cool_roofs": "Use reflective roofing materials or white roofs.",
            "urban_design": "Create shaded walkways and green corridors.",
            "water": "Promote rainwater harvesting and water features.",
            "energy": "Reduce excessive AC use to lower heat emissions."
        }
    }
}


# Home route
@app.route("/")
def home():
    return "Heat Risk Prediction API is Running"


# Prediction route
@app.route("/predict_heat", methods=["POST"])
def predict_heat():

    data = request.json

    temp_max = data.get("temperature_2m_max")
    temp_min = data.get("temperature_2m_min")

    precip = data.get("precipitation_sum", 0)
    wind = data.get("wind_speed_10m_max", 5)

    if temp_max is None or temp_min is None:
        return jsonify({
            "error": "temperature_2m_max and temperature_2m_min required"
        }), 400

    # Prepare data for model
    sample = pd.DataFrame([[temp_max, temp_min, precip, wind]], columns=[
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "wind_speed_10m_max"
    ])

    # ML prediction
    prediction = model.predict(sample)[0]
    heat_risk = labels[prediction]

    # Return result
    return jsonify({
        "heat_risk": heat_risk,
        "human_recommendations": heat_recommendations[heat_risk]["human_recommendations"],
        "environment_recommendations": heat_recommendations[heat_risk]["environment_recommendations"]
    })


# Run server
if __name__ == "__main__":
    app.run(debug=True)