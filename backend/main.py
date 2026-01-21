from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import shutil
from pathlib import Path
from src2.loader import load_data
from src2.embadding import embadding
from src2.vector_store import vector_storage
from src2.retrive import Retrieve
import threading
from dotenv import load_dotenv
import os

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

UPLOAD_DIR = Path("./data/uploads").resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

embedding_instance = None
vector_store = None
retriever = None
model_lock = threading.Lock()

def load_models_if_needed():
    global embedding_instance, vector_store, retriever

    if embedding_instance is None:
        with model_lock:
            if embedding_instance is None:
                embedding_instance = embadding()
                vector_store = vector_storage("pdf_embeddings", "./vector_db")
                retriever = Retrieve(
                    vector_store=vector_store,
                    embedding=embedding_instance,
                    api_key=GROQ_API_KEY
                )

@app.get("/health")
async def health():
    load_models_if_needed()
    return {"status": "ready"}

@app.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    load_models_if_needed()

    saved = []
    for file in files:
        safe = "".join(c for c in file.filename if c not in r'\/:*?"<>|')
        path = UPLOAD_DIR / safe
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved.append(safe)

    loader = load_data(UPLOAD_DIR)
    docs = loader.load_all_data()

    chunks = embedding_instance.make_chunks(docs)
    texts = [c.page_content for c in chunks]
    embeds = embedding_instance.do_embadding(texts)

    vector_store.add_collection(chunks, embeds)

    for f in UPLOAD_DIR.iterdir():
        if f.is_file():
            f.unlink()

    return {
        "message": "ok",
        "files": len(saved),
        "chunks": len(chunks)
    }


class QueryRequest(BaseModel):
    question: str

@app.post("/query")
async def query_docs(payload: QueryRequest):
    load_models_if_needed()

    q = payload.question.strip()
    if not q:
   
        async def error_stream():
            yield "Ask something meaningful."
        return StreamingResponse(error_stream(), media_type="text/plain")

    retriever.break_query(q)

    async def stream_answer():
        answer = retriever.get_retrieve()
        words = answer.split()
        
        for i, word in enumerate(words):
            if i > 0:
                yield " "
            yield word
            import asyncio
            await asyncio.sleep(0.05)
    
    return StreamingResponse(stream_answer(), media_type="text/plain")