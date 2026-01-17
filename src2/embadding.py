
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

class embadding():
    def __init__(self,chunk_size=400,chunk_overlap=50,model_name="all-MiniLM-L6-v2"):
        self.chunksize=chunk_size
        self.chunkoverlap=chunk_overlap
        self.model_name=model_name
        self.model=SentenceTransformer(model_name)
        print(f"Loaded embedding model: {model_name}")
        pass
    
    def make_chunks(self,documents):
        spliter=RecursiveCharacterTextSplitter(
            chunk_size=self.chunksize,
            chunk_overlap=self.chunkoverlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks=spliter.split_documents(documents)
        print(f"Split {len(documents)} documents into {len(chunks)}")
        return chunks

    def do_embadding(self, text):
        
        print(f"embadding is generating  for texts: {len(text)}\n")
        ebadded_chunks=self.model.encode(text,show_progress_bar=True)

        print(f"embadding shape is : {ebadded_chunks.shape}\n")
        return ebadded_chunks
        
        