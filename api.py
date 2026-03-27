print("NEW API VERSION RUNNING")
from flask import Flask, request, jsonify
import pickle
import pandas as pd

# Create Flask app
app = Flask(__name__)

# Load trained model
model = pickle.load(open("models/heat_model.pkl", "rb"))

# Label mapping
labels = {
    0: "Low",
    1: "Medium",
    2: "High"
}

# Advice system
advice = {

    "Low": {
        "clothing": "Weather is comfortable. Wear light casual clothes.",
        "outdoor_advice": "Outdoor activities are safe throughout the day.",
        "hydration": "Drink water regularly.",
        "food": [
            "Eat fruits like banana and apple",
            "Maintain balanced meals"
        ],
        "health_tips": [
            "Maintain normal hydration",
            "Wear comfortable clothes"
        ]
    },

    "Medium": {
        "clothing": "Wear light cotton clothes and apply sunscreen.",
        "outdoor_advice": "Avoid outdoor activities between 12 PM and 3 PM.",
        "hydration": "Drink water every 30–45 minutes.",
        "food": [
            "Eat watermelon",
            "Eat cucumber",
            "Drink buttermilk"
        ],
        "health_tips": [
            "Carry a water bottle",
            "Use sunglasses or cap outdoors",
            "Take breaks in shade"
        ]
    },

    "High": {
        "clothing": "Wear sunscreen, cap, and breathable cotton clothes.",
        "outdoor_advice": "Avoid going outside between 11 AM and 4 PM.",
        "hydration": "Drink water every 20–30 minutes.",
        "food": [
            "Watermelon",
            "Cucumber",
            "Tender coconut water",
            "Buttermilk"
        ],
        "health_tips": [
            "Stay indoors during peak heat",
            "Avoid strenuous outdoor activity",
            "Take cool showers",
            "Check elderly and children for heat stress"
        ],
        "cooling_tips": [
            "Use fans or air conditioning",
            "Close curtains to block sunlight"
        ]
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

    sample = pd.DataFrame([[
        data["temperature_2m_max"],
        data["temperature_2m_min"],
        data["precipitation_sum"],
        data["wind_speed_10m_max"]
    ]], columns=[
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "wind_speed_10m_max"
    ])

    prediction = model.predict(sample)[0]

    risk = labels[prediction]

    return jsonify({
        "heat_risk": risk,
        "clothing": advice[risk]["clothing"],
        "outdoor_advice": advice[risk]["outdoor_advice"],
        "hydration": advice[risk]["hydration"],
        "food": advice[risk]["food"],
        "health_tips": advice[risk]["health_tips"]
    })

# Run server
if __name__ == "__main__":
    app.run(debug=True)