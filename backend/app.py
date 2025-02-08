from flask import Flask, request
import os
import dotenv
from google import genai
from GetNews import get as get_news
from flask import jsonify

dotenv.load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Initialize Gemini

client = genai.Client(GEMINI_API_KEY)

#model = client.model.generate()




app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/about')
def about():
    return "About page"

@app.route('/mahin')
def mahin():
    return "Mahin page"

@app.route('/suggest')
def suggest():
    
    # Import data from the request from the headers

    data = request.headers.get('data')

@app.route('/news')
def news():
    try:
        news_data = get_news()
        return jsonify(news_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    




    


if __name__ == '__main__':
    app.run(debug=True)