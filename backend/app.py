from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from flask_cors import CORS
from GetNews import GetNewsContent
from openai import OpenAI, OpenAIError
import base64
from pptx import Presentation
from PIL import Image
import io
import traceback
import PyPDF2

app = Flask(__name__)

# Simple CORS configuration
CORS(app, supports_credentials=True)

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

UPLOAD_FOLDER = "uploads"
TEMP_DIR = "temp"  # Add this line

ALLOWED_EXTENSIONS = {"pdf"}


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(TEMP_DIR):  # Add this line
    os.makedirs(TEMP_DIR)  # Add this line


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Validate API keys
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")
if not NEWS_API_KEY:
    raise ValueError("NEWS_API_KEY not found in environment variables")

# Initialize OpenAI client with proper authentication
client = OpenAI(
    api_key=OPENAI_API_KEY,
)


def convert_slide_to_image(pptx_path, slide_index=0):
    """Convert a PowerPoint slide to an image"""
    prs = Presentation(pptx_path)
    if slide_index >= len(prs.slides):
        raise ValueError("Slide index out of range")

    # Create a temporary buffer to save the slide as PNG
    image_stream = io.BytesIO()
    # TODO: Add conversion logic here - requires additional setup
    # For now, we'll use a placeholder image
    Image.new("RGB", (800, 600), "white").save(image_stream, format="PNG")
    image_stream.seek(0)
    return image_stream.getvalue()


def generate_w_pptx(file_path, prompt):
    try:
        # Convert PowerPoint slide to image
        image_data = convert_slide_to_image(file_path)

        # Convert image data to base64
        base64_image = base64.b64encode(image_data).decode("utf-8")

        # Create message with file attachment
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            },
                        },
                    ],
                }
            ],
            max_tokens=1000,
        )

        return response.choices[0].message.content

    except FileNotFoundError:
        raise Exception("File not found")
    except OpenAIError as e:
        raise Exception(f"OpenAI API error: {str(e)}")
    except Exception as e:
        raise Exception(f"Error processing file: {str(e)}")


def generate_w_pdfs(file_path, prompt):
    try:
        # Read the PDF file
        with open(file_path, "rb") as file:
            # Create PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)

            # Extract text from all pages
            text_content = ""
            for page in pdf_reader.pages:
                text_content += page.extract_text()

        # Create message with the extracted text
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Make sure to use an appropriate model
            messages=[
                {
                    "role": "user",
                    "content": f"{prompt}\n\nHere is the syllabus content:\n{text_content}",
                }
            ],
            max_tokens=1000,
        )

        return response.choices[0].message.content

    except FileNotFoundError:
        raise Exception("File not found")
    except OpenAIError as e:
        raise Exception(f"OpenAI API Error: {str(e)}")
    except Exception as e:
        raise Exception(f"Error processing file: {str(e)}")


@app.route("/suggest", methods=["POST"])
def suggest():
    try:
        news = GetNewsContent(NEWS_API_KEY)
        science_news = news.get_subject_news("biology", days_back=7)

        file_path = os.path.join(
            os.path.dirname(__file__), "2.3. no audio-- The Main Memory.pptx"
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


@app.route("/content-suggest", methods=["POST"])
def content_suggest():
    try:
        # Get the data from the request
        data = request.get_json()
        if not data or "filename" not in data or "subject" not in data:
            return jsonify({"error": "Filename and subject are required"}), 400

        # Get news for the specific subject
        news = GetNewsContent(NEWS_API_KEY)
        subject_news = news.get_subject_news(data["subject"], days_back=7)

        file_path = os.path.join(TEMP_DIR, data["filename"])  # Updated this line

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        prompt = (
            f"Analyze this syllabus and suggest improvements based on "
            f"these recent news articles in {data['subject']}: {subject_news}. "
            f"Focus on incorporating current research trends and "
            f"modern teaching methodologies in {data['subject']} education."
        )

        response = generate_w_pdfs(file_path, prompt)
        return jsonify({"suggestion": response})

    except OpenAIError as e:
        print(f"OpenAI API Error: {str(e)}")
        return jsonify({"error": "OpenAI API Error", "details": str(e)}), 401

    except Exception as e:
        print(f"Error in /content-suggest endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        print("Received request")
        print("Request headers:", dict(request.headers))
        print("Request files:", request.files)

        if "file" not in request.files:
            print("No file part in request")
            return {"error": "No file part"}, 400

        file = request.files["file"]
        subject = request.form.get("subject", "")

        if file.filename == "":
            print("No selected file")
            return {"error": "No selected file"}, 400

        if not subject:
            return {"error": "Subject is required"}, 400

        print(f"Processing file: {file.filename}")
        print(f"Subject: {subject}")

        # Save the file using TEMP_DIR constant
        file_path = os.path.join(TEMP_DIR, file.filename)
        file.save(file_path)
        print(f"File saved at: {file_path}")

        # Read and print the first few bytes of the file (for debugging)
        with open(file_path, "rb") as f:
            content = f.read(100)
        print(f"First 100 bytes: {content}")

        response = jsonify(
            {
                "message": "File processed successfully",
                "filename": file.filename,
                "subject": subject,
            }
        )
        return response

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        traceback.print_exc()
        return {"error": str(e)}, 500


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
