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

# Cargar documentos de texto
loader = TextLoader("PDFsResult/chunk_1.txt", encoding="utf-8")
documents = loader.load()

# Dividir los documentos en partes más pequeñas y agregarlos al vector store
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
vector_store.add_documents(documents=docs)

