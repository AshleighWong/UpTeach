from newapitest import EducationalNewsTools

# Initialize with your API key
edu_tools = EducationalNewsTools("your_api_key")

# Generate materials for a specific lesson
materials = edu_tools.generate_lesson_materials(
    subject="Environmental Science", grade_level="Middle School", topic="Climate Change"
)

# Get current events for a specific subject
science_news = edu_tools.get_subject_news("biology", days_back=7)

# Get general current events
current_events = edu_tools.get_current_events(category="science")
