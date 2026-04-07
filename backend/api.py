print("NEW API VERSION RUNNING")

from flask import Flask, request, jsonify
import pickle
import pandas as pd

# Create Flask app
app = Flask(__name__)

# Heat risk labels
labels = {
    0: "Low",
    1: "Medium",
    2: "High"
}

# Heat risk advice (ML based)
heat_advice = {

    "Low": {
        "clothing": "Weather is comfortable. Wear light casual clothes.",
        "outdoor_advice": "Outdoor activities are safe throughout the day.",
        "hydration": "Drink water regularly."
    },

    "Medium": {
        "clothing": "Wear light cotton clothes and apply sunscreen.",
        "outdoor_advice": "Avoid outdoor activities between 12 PM and 3 PM.",
        "hydration": "Drink water every 30–45 minutes."
    },

    "High": {
        "clothing👚": "Wear sunscreen, cap, and breathable cotton clothes.",
        "outdoor_advice": "Avoid going outside between 11 AM and 4 PM.",
        "hydration": "Drink water every 20–30 minutes."
    }
}

# Climate solution system
def climate_solutions(temp):

    if temp <= 0:
        climate = "Snow / Freezing"
        solutions = {
            "clothing": "Wear heavy winter jackets, thermal wear, gloves, wool caps, and insulated boots.",
            "health": "Avoid long outdoor exposure to prevent frostbite and hypothermia.",
            "food": "Drink warm beverages like tea, coffee, or soup.",
            "safety": "Drive carefully due to icy roads.",
            "home": "Use indoor heating systems."
        }

    elif temp <= 10:
        climate = "Cold"
        solutions = {
            "clothing": "Wear sweaters, jackets, scarves, and layered clothing.",
            "health": "Keep body warm and avoid strong cold winds.",
            "food": "Drink warm liquids and eat hot meals.",
            "outdoor": "Limit outdoor exposure early morning and late night."
        }

    elif temp <= 25:
        climate = "Moderate / Comfortable"
        solutions = {
            "clothing": "Wear light comfortable clothes.",
            "health": "Maintain regular hydration.",
            "outdoor": "Good weather for outdoor activities.",
            "food": "Maintain balanced diet and water intake."
        }

    elif temp <= 35:
        climate = "Warm / Sunny"
        solutions = {
            "clothing": "Wear light cotton clothes.",
            "health": "Apply sunscreen and wear sunglasses.",
            "hydration": "Drink plenty of water.",
            "food": "Eat fruits like watermelon and cucumber."
        }

    else:
        climate = "Hot / Heatwave"
        solutions = {
            "clothing": "Wear breathable clothes, caps, and sunglasses.",
            "health": "Avoid direct sunlight between 11 AM – 4 PM.",
            "hydration": "Drink water every 20–30 minutes.",
            "food": "Eat cooling foods like cucumber and coconut water.",
            "safety": "Stay indoors or in shaded areas."
        }

    return climate, solutions


# Home route
@app.route("/")
def home():
    return "Heat Risk Prediction API is Running"


# Prediction route
@app.route("/predict_heat", methods=["POST"])
def predict_heat():

    data = request.json

    # Safe input handling
    temp_max = data.get("temperature_2m_max")
    temp_min = data.get("temperature_2m_min")

    precip = data.get("precipitation_sum", 0)
    wind = data.get("wind_speed_10m_max", 5)

    if temp_max is None or temp_min is None:
        return jsonify({"error": "temperature_2m_max and temperature_2m_min required"}), 400

    # Create dataframe for model
    sample = pd.DataFrame([[temp_max, temp_min, precip, wind]], columns=[
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "wind_speed_10m_max"
    ])

    # ML prediction
    prediction = model.predict(sample)[0]
    heat_risk = labels[prediction]

    # Climate analysis (use average temperature)
    avg_temp = (temp_max + temp_min) / 2
    climate, climate_advice = climate_solutions(avg_temp)

    return jsonify({
        "heat_risk": heat_risk,
        "heat_advice": heat_advice[heat_risk],
        "climate_type": climate,
        "climate_solutions": climate_advice
    })


# Run server
if __name__ == "__main__":
    app.run(debug=True)