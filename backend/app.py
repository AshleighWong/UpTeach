from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from flask_cors import CORS
from GetNews import get as get_news

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Flask app
app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Hello, Flask!"


@app.route("/about")
def about():
    return "About page"


@app.route("/mahin")
def mahin():
    return jsonify({"message": "Mahin page"})


@app.route("/suggest", methods=["POST"])
def suggest():
    # Get data from request headers
    data = request.headers.get("data")
    # Add your logic here
    return jsonify({"received_data": data})


@app.route("/news")
def news():
    try:
        news_data = get_news()
        return jsonify(news_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
