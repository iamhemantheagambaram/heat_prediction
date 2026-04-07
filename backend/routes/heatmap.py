from flask import Blueprint, jsonify

heatmap_bp = Blueprint('heatmap', __name__)

@heatmap_bp.route('/api/heatmap/<city>')
def heatmap(city):

    data = [
        {"area": "Anna Nagar", "lat": 13.085, "lon": 80.210, "risk": "High"},
        {"area": "T Nagar", "lat": 13.041, "lon": 80.234, "risk": "Medium"},
        {"area": "Velachery", "lat": 12.981, "lon": 80.220, "risk": "Low"}
    ]

    return jsonify(data)