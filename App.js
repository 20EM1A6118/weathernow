import { useState, useEffect } from "react";
import "./style.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [multiWeather, setMultiWeather] = useState([]);

  const defaultCities = [
    "Hyderabad",
    "Delhi",
    "Mumbai",
    "Chennai",
    "Bangalore",
  ];

  // ✅ Fetch weather for default 5 cities (once)
  useEffect(() => {
    const fetchMultiple = async () => {
      const results = [];
      for (const c of defaultCities) {
        try {
          const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
              c
            )}`
          );
          const geoData = await geoResponse.json();
          if (!geoData.results || geoData.results.length === 0) continue;

          const { latitude, longitude, name, country } = geoData.results[0];
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const weatherData = await weatherResponse.json();
          results.push({ ...weatherData.current_weather, name, country });
        } catch (err) {
          console.error("Error fetching weather for:", c);
        }
      }
      setMultiWeather(results);
    };
    fetchMultiple();
  }, []);

  // ✅ Fetch single city on search
  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      setWeather(null);
      return;
    }

    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found");
        setWeather(null);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherResponse.json();

      setWeather({ ...weatherData.current_weather, name, country });
    } catch (err) {
      setError("Failed to fetch weather data");
      setWeather(null);
    }
  };

  // ✅ When user presses Enter
  const onEnter = (e) => {
    if (e.key === "Enter") getWeather();
  };

  // ✅ Reset defaults only when input is empty
  const handleInput = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.trim() === "") {
      setWeather(null);
      setError("");
    }
  };

  return (
    <div className="container">
      <h1>🌤 Weather Now</h1>

      <div className="input-group">
        <input
          type="text"
          value={city}
          onChange={handleInput}
          onKeyDown={onEnter}
          placeholder="Enter city (e.g. Hyderabad)"
        />
        <button onClick={getWeather}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Only show searched city when available */}
      {weather && (
        <div className="weather-card">
          <h2>
            {weather.name}, {weather.country}
          </h2>
          <p>🌡 Temperature: {weather.temperature}°C</p>
          <p>💨 Wind Speed: {weather.windspeed} km/h</p>
          <p>🧭 Direction: {weather.winddirection}°</p>
        </div>
      )}

      {/* Show default 5 cities ONLY when no city is being searched */}
      {!weather && !city.trim() && (
        <>
          <h2 style={{ marginTop: "30px" }}>🌍 Default Cities</h2>
          <div className="city-grid">
            {multiWeather.map((w, index) => (
              <div key={index} className="weather-card small">
                <h3>
                  {w.name}, {w.country}
                </h3>
                <p>🌡 {w.temperature}°C</p>
                <p>💨 {w.windspeed} km/h</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
