from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from flask_cors import CORS
from GetNews import get as get_news
import openai

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini

#client = genai.Client(GEMINI_API_KEY)

#model = client.model.generate()


client = openai.OpenAI(
    base_url="https://api.ai.it.cornell.edu", 
)
 

def generate(model, prompt):
    response = client.chat.completions.create(
    model=model,
    messages = [
        {
            "role": "user",
            "content": prompt,
        }
        ]
    )
    return response['messages'][0]['content']


def generate_w_pdfs(model, file_path, prompt):
    file_obj = openai.Client().files.create(
        file=open(file_path, "rb"),
        purpose="assistants"
    )

    response = openai.Client().chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        file_ids=[file_obj.id]  
    )

    return response.choices[0].message['content']





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

    file = data.get('file')

    news = get_news()

    prompt = ' Use the following pdf and the following news articles to further enhance and suggest changes to make the lesson plan more relevant and engaging. ' + file + ' ' + news

    response = generate_w_pdfs("", file, prompt)

    return jsonify(response)

    

@app.route("/news")
def news():
    try:
        news_data = get_news()
        return jsonify(news_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
