from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import torch
import multiprocessing

class embadding():
    def __init__(self, chunk_size=1000, chunk_overlap=150, model_name="all-MiniLM-L6-v2"):
        self.chunksize = chunk_size
        self.chunkoverlap = chunk_overlap
        self.model_name = model_name

        torch.set_num_threads(multiprocessing.cpu_count())
        
        
        self.model = SentenceTransformer(model_name, device='cpu')
        
        print(f"Loaded embedding model: {model_name}")
        print(f"Using {multiprocessing.cpu_count()} CPU cores for parallel processing")
    
    def make_chunks(self, documents):
        spliter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunksize,
            chunk_overlap=self.chunkoverlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = spliter.split_documents(documents)
        print(f"Split {len(documents)} documents into {len(chunks)} chunks")
        return chunks

    def do_embadding(self, text):
        print(f"Embedding is generating for {len(text)} texts\n")
        
    
        ebadded_chunks = self.model.encode(
            text,
            batch_size=32,            
            show_progress_bar=True,
            convert_to_numpy=True,    
            normalize_embeddings=True  
        )

        print(f"Embedding shape is: {ebadded_chunks.shape}\n")
        return ebadded_chunks