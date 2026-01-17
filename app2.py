from src2.loader import load_data
from src2.embadding import embadding
from src2.vector_store import vector_storage
from src2.retrive import Retrieve
import os

if __name__ == "__main__":
  
    # data_loader = load_data("./data")
    # data = data_loader.load_all_data()
    # print(f"[INFO] Loaded {len(data)} documents.")

    embadding_instance = embadding()
    # chunks = embadding_instance.make_chunks(data)
    # text = [chunk.page_content for chunk in chunks]
    # embedded_chunks = embadding_instance.do_embadding(text)

    vector_store = vector_storage("pdf_embeddings", "./vector_db")
  
 
    your_query = input("Enter your query: ")
    
    retrive_doc = Retrieve(vector_store, embadding_instance, your_query, api_key=os.getenv("API_KEY"))
    retrive_doc.break_query()
    final_answer=retrive_doc.get_retrieve()
    
   
    print("\n[AI RESPONSE]:\n",final_answer)
