const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración de Azure Search
const vectorStoreAddress = "AzureEndpoint";
const vectorStorePassword = "AzureKey";
const indexName = "indice2";

// Función para cargar todos los archivos de texto de una carpeta
function loadDocumentsFromFolder(folderPath) {
  const documents = [];
  const files = fs.readdirSync(folderPath);
  files.forEach(file => {
    if (file.endsWith('.txt')) {
      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      documents.push(content);
    }
  });
  return documents;
}

// Función para dividir el texto en partes más pequeñas
function splitDocuments(documents, chunkSize = 1000) {
  const chunks = [];
  documents.forEach(doc => {
    for (let i = 0; i < doc.length; i += chunkSize) {
      chunks.push(doc.substring(i, i + chunkSize));
    }
  });
  return chunks;
}

// Función para subir documentos al vector store de Azure Search
async function addDocumentsToVectorStore(docs) {
  const documents = docs.map((doc, index) => ({
    '@search.action': 'upload',
    id: `doc-${index}`,
    text: doc
    // Aquí puedes agregar más campos si es necesario
  }));

  await axios.post(
    `${vectorStoreAddress}/indexes/${indexName}/docs/index?api-version=2021-04-30-Preview`,
    {
      value: documents
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': vectorStorePassword
      }
    }
  );
}

(async () => {
  try {
    // Ruta de la carpeta que contiene los archivos de texto
    const folderPath = "PDFsResult";

    // Cargar todos los documentos de texto de la carpeta
    const documents = loadDocumentsFromFolder(folderPath);
    console.log(`Se cargaron correctamente ${documents.length} documentos.`);

    // Dividir los documentos en partes más pequeñas
    const docs = splitDocuments(documents);

    // Agregar los documentos divididos al vector store
    await addDocumentsToVectorStore(docs);
    console.log("Los documentos se subieron correctamente al vector store.");
  } catch (e) {
    console.error(`Ocurrió un error durante la carga o subida de documentos: ${e.message}`);
  }
})();
