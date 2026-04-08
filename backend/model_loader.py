import os
import pickle

def load_model():
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "models", "heat_model.pkl")

        print("Loading model from:", model_path)

        with open(model_path, "rb") as f:
            model = pickle.load(f)

        print("Model loaded")
        print("Features expected:", model.n_features_in_)

        return model

    except Exception as e:
        print("Model load error:", e)
        return None

model = load_model()