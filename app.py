from flask import Flask, render_template, jsonify
import urllib.request
import urllib.parse
import json
from datetime import datetime
import random

app = Flask(__name__)

# ── Routes ──────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/weather")
def weather():
    """
    Fetches weather for a hardcoded city using the Open-Meteo API (free, no key needed).
    Change CITY_NAME / LAT / LON to your location.
    """
    CITY_NAME = "New York"
    LAT = 40.7128
    LON = -74.0060

    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={LAT}&longitude={LON}"
        f"&current_weather=true"
        f"&hourly=relativehumidity_2m"
    )

    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read())
        cw = data["current_weather"]
        # Grab humidity for current hour index
        current_hour_index = datetime.utcnow().hour
        humidity = data["hourly"]["relativehumidity_2m"][current_hour_index]

        return jsonify({
            "city": CITY_NAME,
            "temp_c": cw["temperature"],
            "temp_f": round(cw["temperature"] * 9/5 + 32, 1),
            "windspeed": cw["windspeed"],
            "humidity": humidity,
            "is_day": cw["is_day"],
            "weather_code": cw["weathercode"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/quote")
def quote():
    """Returns a random motivational / dev quote."""
    quotes = [
        {"text": "The best way to predict the future is to invent it.", "author": "Alan Kay"},
        {"text": "Code is like humor. When you have to explain it, it's bad.", "author": "Cory House"},
        {"text": "First, solve the problem. Then, write the code.", "author": "John Johnson"},
        {"text": "Make it work, make it right, make it fast.", "author": "Kent Beck"},
        {"text": "Simplicity is the soul of efficiency.", "author": "Austin Freeman"},
        {"text": "Before software can be reusable it first has to be usable.", "author": "Ralph Johnson"},
        {"text": "The most disastrous thing you can ever learn is your first programming language.", "author": "Alan Kay"},
        {"text": "Talk is cheap. Show me the code.", "author": "Linus Torvalds"},
    ]
    return jsonify(random.choice(quotes))


@app.route("/api/todos", methods=["GET"])
def get_todos():
    """Returns a starter todo list (in a real app you'd use a database)."""
    todos = [
        {"id": 1, "text": "Set up Flask project ✅", "done": True},
        {"id": 2, "text": "Connect weather API", "done": False},
        {"id": 3, "text": "Style the dashboard", "done": False},
        {"id": 4, "text": "Push to GitHub 🚀", "done": False},
    ]
    return jsonify(todos)


# ── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True)
