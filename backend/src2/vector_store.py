import chromadb
import uuid
import os
from pathlib import Path

class vector_storage():

    def __init__(self, collection_name: str, path_dir: str):
        self.collection_name = collection_name
        self.path_dir = Path(path_dir).resolve()
        os.makedirs(self.path_dir, exist_ok=True)

        self.client = chromadb.PersistentClient(path=str(self.path_dir))
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "PDF document embeddings for RAG"}
        )

    def add_collection(self, chunks, embadding):
        if len(chunks) != len(embadding):
            raise ValueError("chunks and embeddings length mismatch")

      
        batch_size = 500
        total_chunks = len(chunks)
        
        print(f"Adding {total_chunks} chunks to vector store in batches of {batch_size}...")
        
        for batch_start in range(0, total_chunks, batch_size):
            batch_end = min(batch_start + batch_size, total_chunks)
            
            batch_chunks = chunks[batch_start:batch_end]
            batch_embeddings = embadding[batch_start:batch_end]
            
            metadata_list = []
            doc_text = []
            embadding_list = []
            ids = []

            for i, (embad, doc) in enumerate(zip(batch_embeddings, batch_chunks)):
                global_idx = batch_start + i
                ids.append(f"doc_{uuid.uuid4()}_{global_idx}")

                metadata = dict(doc.metadata)
                metadata["index"] = global_idx
                metadata["content_length"] = len(doc.page_content)

                metadata_list.append(metadata)
                embadding_list.append(embad.tolist())
                doc_text.append(doc.page_content)

            self.collection.add(
                embeddings=embadding_list,
                metadatas=metadata_list,
                documents=doc_text,
                ids=ids
            )
            
            print(f" Batch {batch_start//batch_size + 1}: Added chunks {batch_start}-{batch_end}")

        print(f"All {total_chunks} chunks saved in vector storage")
