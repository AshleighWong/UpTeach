from GetNews import GetNewsContent
import os
import dotenv

dotenv.load_dotenv()

# Initialize with API key
edu_tools = GetNewsContent(os.getenv("NEWSAPI_KEY"))


# Get current events for a specific subject
# options available in categories.txt
science_news = edu_tools.get_subject_news("biology", days_back=7)

# Get general current events
current_events = edu_tools.get_current_events(category="science")



print(science_news)
print(current_events)
