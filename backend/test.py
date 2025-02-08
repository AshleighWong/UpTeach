from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from flask_cors import CORS
from GetNews import GetNewsContent
from openai import OpenAI, OpenAIError

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

# Validate API keys
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")
if not NEWS_API_KEY:
    raise ValueError("NEWS_API_KEY not found in environment variables")

# Initialize OpenAI client with proper authentication
client = OpenAI(
    api_key=OPENAI_API_KEY,
)

app = Flask(__name__)
CORS(app)

def generate_w_pdfs(file_path, prompt):
    try:
        # Upload file
        with open(file_path, "rb") as file:
            file_obj = client.files.create(
                file=file,
                purpose="assistants"
            )

        # Create completion
        response = client.chat.completions.create(
            model="gpt-4",  # Updated model name
            messages=[{
                "role": "user",
                "content": prompt
            }],
            file_ids=[file_obj.id]
        )
        
        # Extract content
        if hasattr(response, 'choices') and response.choices:
            return response.choices[0].message.content
        return "No response generated"
        
    except OpenAIError as e:
        print(f"OpenAI API Error: {str(e)}")
        raise
    except Exception as e:
        print(f"Error in generate_w_pdfs: {str(e)}")
        raise

@app.route("/suggest", methods=["POST"])
def suggest():
    try:
        news = GetNewsContent(NEWS_API_KEY)
        science_news = news.get_subject_news("biology", days_back=7)
        
        file_path = os.path.join(
            os.path.dirname(__file__), 
            "2.3. no audio-- The Main Memory.pptx"
        )
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        prompt = (
            "Analyze this presentation and suggest improvements based on "
            f"these recent news articles: {science_news}"
        )
        
        response = generate_w_pdfs(file_path, prompt)
        return jsonify({"suggestion": response})
        
    except OpenAIError as e:
        print(f"OpenAI API Error: {str(e)}")
        return jsonify({"error": "OpenAI API Error", "details": str(e)}), 401
    except Exception as e:
        print(f"Error in /suggest endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return "Hello, Flask!"


@app.route("/about")
def about():
    return "About page"


@app.route("/mahin")
def mahin():
    return jsonify({"message": "Mahin page"})


if __name__ == "__main__":
    app.run(debug=True)
