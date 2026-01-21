from pathlib import Path
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,

)


class load_data:
    def __init__(self, data_path: str):
        self.path = data_path

    def load_all_data(self):
        documents = []
        base_path = Path(self.path).resolve()

        loaders = [
            ("**/*.pdf", PyPDFLoader),
            ("**/*.txt", TextLoader),
            ("**/*.docx", Docx2txtLoader)
        ]

        for pattern, LoaderClass in loaders:
            files = list(base_path.glob(pattern))
            print(
                f"{pattern} files found: {len(files)} -> {[f.name for f in files]}")

            for file in files:
                loader = LoaderClass(str(file))
                documents.extend(loader.load())


        return documents
