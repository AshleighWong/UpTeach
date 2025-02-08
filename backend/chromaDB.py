import chromadb
from GetNews import GetNewsContent
import dotenv
import os

dotenv.load_dotenv()

edu_tools = GetNewsContent(os.getenv("NEWSAPI_KEY"))

chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="news")
def add_documents(documents, ids):
    collection.upsert(
            documents=[documents],
            ids=[str(ids)],
    )
    
for i in range(1):
    science_news = edu_tools.get_subject_news("biology", days_back=7)
    add_documents([science_news], i)

results = collection.query(
query_texts=["This is a query document about current news on science"], # Chroma will embed this for you
n_results=2 # how many results to return
)
print(results)




