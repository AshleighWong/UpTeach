from newapitest import EducationalNewsTools
import os
import dotenv

dotenv.load_dotenv()

# Initialize with your API key
edu_tools = EducationalNewsTools(os.getenv("NEWSAPI_KEY"))


# Generate materials for a specific lesson
materials = edu_tools.generate_lesson_materials(
    subject="Environmental Science", grade_level="Middle School", topic="Climate Change"
)

# Get current events for a specific subject
# options available in categories.txt
science_news = edu_tools.get_subject_news("biology", days_back=7)

# Get general current events
current_events = edu_tools.get_current_events(category="science")

print(science_news)
