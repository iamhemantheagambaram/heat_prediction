import json
import random
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

class ChatModel:
    def __init__(self):
        path = os.path.join("data", "intents.json")

        # ✅ UTF-8 fix for Tamil
        with open(path, encoding="utf-8") as f:
            self.data = json.load(f)

        self.patterns = []
        self.tags = []

        for intent in self.data["intents"]:
            for pattern in intent["patterns"]:
                self.patterns.append(pattern.lower())
                self.tags.append(intent["tag"])

        self.vectorizer = TfidfVectorizer()
        X = self.vectorizer.fit_transform(self.patterns)

        self.model = LogisticRegression(max_iter=200)
        self.model.fit(X, self.tags)

    def predict(self, text):
        try:
            X = self.vectorizer.transform([text.lower()])
            return self.model.predict(X)[0]
        except:
            return "default"

    def get_response(self, tag, language="en"):
        for intent in self.data["intents"]:
            if intent["tag"] == tag:

                # ✅ Tamil response
                if language == "ta":
                    return random.choice(
                        intent.get("responses_ta", intent.get("responses_en", []))
                    )

                # ✅ English response
                return random.choice(intent.get("responses_en", []))

        return "Ask me about heat or weather."