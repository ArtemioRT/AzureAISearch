async function(properties, context) {
  const mammoth = require('mammoth');

  if (!properties.docUrl) {
    throw new Error('docUrl is required in properties');
  }

  let docUrl = properties.docUrl;

  // Asegurarse de que la URL tenga el esquema correcto
  if (!/^https?:\/\//i.test(docUrl)) {
    docUrl = 'https://' + docUrl;
  }

  try {
    // Importar dinámicamente 'node-fetch'
    const fetch = (await import('node-fetch')).default;

    // Asegurarse de que la URL esté correctamente formada
    let url;
    try {
      url = new URL(docUrl);
    } catch (err) {
      throw new Error('Invalid URL');
    }

    // Descargar el archivo DOC/DOCX
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const docBuffer = await response.buffer();

    // Extraer el texto del DOC/DOCX usando mammoth
    const { value } = await mammoth.extractRawText({ buffer: docBuffer });
    const text = value.trim();

    // Integrar el texto extraído con Azure Cognitive Search
    const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');
    const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
    const { OpenAIEmbeddings } = require('@langchain/openai');
    
    // Reemplazar con tu clave de API de OpenAI real
    const openaiApiKey = 'key';
    
    // Dividir el contenido del archivo en documentos más pequeños
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 0,
    });
    const documents = await splitter.splitDocuments([{ pageContent: text, metadata: { source: "bubble.io" }}]);
    
    // Crear embeddings usando OpenAI
    const openaiEmbeddings = new OpenAIEmbeddings({ apiKey: openaiApiKey });
    const embeddings = await openaiEmbeddings.embedDocuments(documents.map(doc => doc.pageContent));
    
    // Detalles de Azure Cognitive Search
    const endpoint = "AzureEndpoint";
    const apiKey = "AzureKey";
    const indexName = "hotels-vector-quickstar";
    
    // Configurar el cliente de búsqueda
    const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));
    
    // Preparar documentos para Azure Cognitive Search
    const azureDocuments = documents.map((doc, index) => ({
      '@search.action': 'upload',
      HotelId: `doc-${index}`, // Usar HotelId como campo clave
      HotelName: `Document ${index}`, // Marcador de posición para HotelName
      Description: doc.pageContent,
      DescriptionVector: embeddings[index],
      Category: 'Document', // Marcador de posición para Category
      Tags: ['uploaded'], // Marcador de posición para Tags
      ParkingIncluded: false, // Marcador de posición
      LastRenovationDate: new Date().toISOString(), // Fecha actual como marcador de posición
      Rating: 0, // Marcador de posición
      Address: { // Marcador de posición para Address
        StreetAddress: '',
        City: '',
        StateProvince: '',
        PostalCode: '',
        Country: ''
      },
      Location: null // Marcador de posición para Location
    }));
    
    if (azureDocuments.length === 0) {
      throw new Error("No documents found to index.");
    }
    
    // Subir documentos al índice de Azure Cognitive Search
    const batch = await client.uploadDocuments(azureDocuments);
    console.log(`${batch.results.length} documents uploaded successfully to Azure Cognitive Search.`);
    
    // Devolver mensaje de éxito
    return `${batch.results.length} documents uploaded successfully to Azure Cognitive Search.`;
  } catch (err) {
    console.error('Error extracting DOC/DOCX text:', err);
    throw err;
  }
}
