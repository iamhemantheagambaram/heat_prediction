from backend.weather import get_weather

# Hosur coordinates
lat = 12.7409
lon = 77.8253

temp, humidity = get_weather(lat, lon)

# ✅ TEST 1: Check values exist
assert temp is not None, "Temperature is missing"
assert humidity is not None, "Humidity is missing"

# ✅ TEST 2: Check realistic range
assert -10 <= temp <= 60, "Temperature out of range"
assert 0 <= humidity <= 100, "Humidity out of range"

# ✅ TEST 3: Print success
print("✅ Weather API Test Passed")
print("Temperature:", temp)
print("Humidity:", humidity)