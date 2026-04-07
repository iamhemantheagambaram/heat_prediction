import os
import pickle

def load_model():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        base_dir = os.path.dirname(current_dir)

        model_path = os.path.join(base_dir, "models", "heat_model.pkl")

        print("Loading model from:", model_path)

        with open(model_path, "rb") as f:
            model = pickle.load(f)

        print("✅ Model loaded successfully")
        print("Model expects features:", model.n_features_in_)

        return model

    except Exception as e:
        print("❌ Model loading failed:", e)
        return None

model = load_model()