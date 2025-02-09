# API Documentation

## 1. `GET /`  
Returns a simple “Hello, Flask!” message.  
Used for quickly checking that the Flask application is online.

## 2. `GET /about`  
Returns a brief “About page” message.  
Not currently used in the frontend.

## 3. `GET /mahin`  
Returns a simple JSON: `{ "message": "Mahin page" }`.  
Not currently used in the frontend.

## 4. `POST /upload`  
Uploads a PDF or PPTX file, then saves it in the temporary directory (`temp`).  
• Request Body: multipart/form-data containing:
  - file: The syllabus file (PDF or PPTX).  
  - subject: The subject name.  
• Response JSON on success:
  ```json
  {
    "message": "File processed successfully",
    "filename": "<actual filename>",
    "subject": "<subject name>"
  }
  ```
• This route is called first from the frontend to store the file on the server.

## 5. `POST /content-suggest`  
Generates suggestions based on the uploaded syllabus and recent news about the subject.  
• Request Body: JSON containing:
  - filename: The file name returned by /upload
  - subject: The subject name  
• Response JSON:
  ```json
  {
    "suggestion": "...some text suggestions..."
  }
  ```
• In the frontend, this is called after `/upload` completes, passing the same filename.

## 6. `POST /convert-pdf`  
Converts each page of an uploaded PDF into a base64-encoded PNG image.  
• Request Body: multipart/form-data containing:
  - file: The PDF file  
• Response JSON on success:
  ```json
  {
    "slides": [
      "data:image/png;base64,<image data>",
      ...
    ]
  }
  ```
• The frontend (in page.tsx) calls this to display PDF pages slide-by-slide.

## 7. `POST /convert-pptx`  
Similar to `/convert-pdf` but converts each PowerPoint slide into a base64-encoded PNG.  
• Request Body: multipart/form-data containing:
  - file: The PPTX file  
• Response JSON on success:
  ```json
  {
    "slides": [
      "data:image/png;base64,<image data>",
      ...
    ]
  }
  ```
• The frontend calls this to display PPTX slides.

## 8. `POST /lesson-plan`  
Analyzes a PDF or PPTX file and returns suggestions in JSON format.  
• Request Body: multipart/form-data containing:
  - file: The lesson plan file (PDF or PPTX)
  - subject: The subject name  
• Response JSON example:
  ```json
  {
    "suggestion": [
      {
        "slide": 1,
        "suggestions": [
          {
            "content": "...suggestion text...",
            "link": "...optional link..."
          }
        ]
      }
    ]
  }
  ```
• Used in the “lesson” frontend page (`page.tsx`) to display suggestions for each slide/page.
