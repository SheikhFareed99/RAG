import numpy as np
import chromadb
from chromadb.config import Settings
import uuid
from typing import List, Dict, Any, Tuple
from sklearn.metrics.pairwise import cosine_similarity
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

        metadata_list = []
        doc_text = []
        embadding_list = []
        ids = []

        for i, (embad, doc) in enumerate(zip(embadding, chunks)):
            ids.append(f"doc_{uuid.uuid4()}_{i}")

            metadata = dict(doc.metadata)
            metadata["index"] = i
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

        print("All content saved in vector storage")
