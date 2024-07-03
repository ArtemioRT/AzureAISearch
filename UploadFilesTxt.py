import os
from langchain_community.vectorstores.azuresearch import AzureSearch
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

# Configuración de la API de OpenAI y Azure Search
openai_api_key = "key"
openai_api_version = "2023-05-15"
model = "text-embedding-ada-002"
vector_store_address = "AzureEndpoint"
vector_store_password = "AzureKey"

# Configuración de Azure Search
index_name = "indice2"

# Crear instancias de OpenAIEmbeddings y AzureSearch
embeddings = OpenAIEmbeddings(
    openai_api_key=openai_api_key,
    openai_api_version=openai_api_version,
    model=model
)

# Crear instancia de AzureSearch
vector_store = AzureSearch(
    azure_search_endpoint=vector_store_address,
    azure_search_key=vector_store_password,
    index_name=index_name,
    embedding_function=embeddings.embed_query,
)

# Función para cargar todos los archivos de texto de una carpeta
def load_documents_from_folder(folder_path):
    documents = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".txt"):
            file_path = os.path.join(folder_path, filename)
            loader = TextLoader(file_path, encoding="utf-8")
            documents.extend(loader.load())
    return documents

# Ruta de la carpeta que contiene los archivos de texto
folder_path = "PDFsResult"

try:
    # Cargar todos los documentos de texto de la carpeta
    documents = load_documents_from_folder(folder_path)
    print(f"Se cargaron correctamente {len(documents)} documentos.")

    # Dividir los documentos en partes más pequeñas
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    docs = text_splitter.split_documents(documents)

    # Agregar los documentos divididos al vector store
    vector_store.add_documents(documents=docs)
    print("Los documentos se subieron correctamente al vector store.")
except Exception as e:
    print(f"Ocurrió un error durante la carga o subida de documentos: {e}")
