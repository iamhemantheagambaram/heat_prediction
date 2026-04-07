from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    msg = request.json.get("message", "").lower()

    if "heat" in msg:
        return jsonify({"reply": "Heat is high. Stay hydrated and avoid sun."})

    return jsonify({"reply": "Ask about climate conditions."})