def get_recommendation(risk):
    if risk == "High":
        return ["Plant trees", "Use cool roofs", "Avoid outdoor 12-3 PM"]
    elif risk == "Medium":
        return ["Increase greenery"]
    else:
        return ["Conditions normal"]