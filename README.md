# 📚 RAG (Retrieval-Augmented Generation) Project

This project is a **Retrieval-Augmented Generation (RAG) system** built using **FastAPI**, **ChromaDB**,**Langchain**,**hugging face ** and an **LLM (via Groq API)**. It allows users to upload documents, generate embeddings, store them in a vector database, and query those documents using natural language.

The system is designed to answer questions **only from the provided documents**, making it suitable for private knowledge bases, academic material, or internal documentation systems.

---

## 🚀 Features

* 📄 Upload documents (PDF / text-based files)
* 🧠 Generate embeddings from uploaded data
* 🗃️ Store embeddings in **ChromaDB**
* 🔍 Retrieve relevant chunks using semantic search
* 🤖 Generate answers using an LLM based strictly on retrieved context
* ⚡ FastAPI backend with clean modular structure

---

## 🏗️ Project Architecture

```
rag-project/
│
├── main.py                     # FastAPI entry point
├── .env                        # Environment variables
├── requirements.txt
│
├── data/
│   └── uploads/                # Uploaded files storage
│
├── src2/
│   ├── loader.py               # Loads & chunks documents
│   ├── embadding.py            # Generates embeddings
│   ├── vector_store.py         # ChromaDB storage logic
│   └── retrive.py               # Retrieval & querying logic
│
└── README.md
```

---

## 🧠 How RAG Works (Flow)

1. **Document Upload**

   * User uploads files via API
   * Files are saved in `data/uploads/`

2. **Document Loading (LangChain)**

   * LangChain loaders are used to read documents (PDFs / text files)
   * This abstracts file parsing and keeps the pipeline clean

3. **Text Chunking (LangChain)**

   * Documents are split into smaller chunks using LangChain text splitters
   * Chunking improves retrieval accuracy and embedding quality

4. **Embedding Generation (Hugging Face)**

   * Each text chunk is converted into a vector using a Hugging Face embedding model
   * Sentence-Transformers models are used for semantic understanding

5. **Vector Storage (ChromaDB)**

   * Generated embeddings are stored in ChromaDB
   * Enables fast semantic similarity search

6. **Query & Retrieval**

   * User asks a question
   * ChromaDB retrieves the most relevant chunks based on vector similarity

7. **Answer Generation (LLM)**

   * Retrieved context is passed to the LLM
   * LLM generates an answer **strictly from retrieved context**

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```
GROQ_API_KEY=your_groq_api_key_here
```

---

## 📦 Installation

1. Clone the repository

```
git clone <your-repo-url>
cd rag-project
```

2. Create a virtual environment (recommended)

```
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # Linux/Mac
```

3. Install dependencies

```
pip install -r requirements.txt
```

---

## ▶️ Running the Project

Start the FastAPI server:

```
uvicorn main:app --reload
```

The API will be available at:

```
http://127.0.0.1:8000
```

Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

## 🔌 API Endpoints (Overview)

### Upload Documents

* Upload files to build the knowledge base

### Ask Question

* Send a question
* System retrieves relevant context
* LLM generates an answer strictly from documents

---

## 🔒 Important Rules Enforced

* ❌ No hallucinations
* ✅ Answers are generated **only** from uploaded data
* ❌ If information is not found, the model responds accordingly

---

## 🛠️ Tech Stack

* **Backend**: FastAPI
* **Vector DB**: ChromaDB
* **LLM Provider**: Groq
* **Embeddings**: Hugging Face Sentence Transformers
* **Framework Utilities**: LangChain
* **Language**: Python

---

## 📌 Use Cases

* Private document Q&A system
* Academic research assistant
* Internal company knowledge base
* Course material assistant

---

## 📄 License

This project is for educational and learning purposes.

---

## 👨‍💻 Author

**Fareed Sheikh**

RAG-based AI System using modern LLM pipelines 🚀
