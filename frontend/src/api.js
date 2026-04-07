const BASE_URL = "http://127.0.0.1:5000";

export const getPrediction = async () => {
  try {
    const response = await fetch(`${BASE_URL}/predict_heat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        temperature_2m_max: 34,
        temperature_2m_min: 30,
        precipitation_sum: 0,
        wind_speed_10m_max: 10
      })
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return await response.json();

  } catch (error) {
    console.error("API ERROR:", error);
    throw error;
  }
};