from src2.loader import load_data
from src2.embadding import embadding
from src2.vector_store import vector_storage
from src2.retrive import Retrieve
from dotenv import load_dotenv
import os

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


if __name__ == "__main__":
    
    embadding_instance = embadding(chunk_size=1000, chunk_overlap=150)
    
    data_loader = load_data("./data")
    data = data_loader.load_all_data()
    print(f"[INFO] Loaded {len(data)} documents.")

    chunks = embadding_instance.make_chunks(data)
    text = [chunk.page_content for chunk in chunks]
    embedded_chunks = embadding_instance.do_embadding(text)

    vector_store = vector_storage("pdf_embeddings", "./vector_db")
    
    retrive_doc = Retrieve(vector_store, embadding_instance, api_key=GROQ_API_KEY)
    
    while True:
        your_query = input("Enter your query: ")
        if your_query=="-1":
            break

        retrive_doc.break_query(your_query)
        final_answer=retrive_doc.get_retrieve()
        
        print("\n[AI RESPONSE]:\n",final_answer,"\n\n")