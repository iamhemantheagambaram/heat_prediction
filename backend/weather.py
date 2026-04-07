import requests

API_KEY = "7c9d285a27bb53b0da08b1b8417bca0e"

def get_weather(lat, lon):
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        res = requests.get(url).json()

        print("Weather API Response:", res)

        if res.get("cod") != 200:
            return 30, 60, 1010, 2  # fallback

        temp = res["main"]["temp"]
        humidity = res["main"]["humidity"]
        pressure = res["main"]["pressure"]
        wind = res["wind"]["speed"]

        return temp, humidity, pressure, wind

    except Exception as e:
        print("Weather API Error:", e)
        return 30, 60, 1010, 2