from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader

class load_data():
    def  __init__(self, data_p:str):
       self.path=data_p

    def load_all_data(self):
        documents=[]
        file_path = Path(self.path).resolve()
        all_files=list(file_path.glob('**/*.pdf'))
        print(f"Number of PDF files found: {len(all_files)} names are :{[f.name for f in all_files]}")
        for file in all_files:
            loader = PyPDFLoader(str(file))
            loaded = loader.load()
            documents.extend(loaded)
        return documents
    

        