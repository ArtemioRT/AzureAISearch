async function(properties, context) {
  try {
    // Import necessary modules
    const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');
    const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
    const { OpenAIEmbeddings } = require('@langchain/openai');

    // Obtener el contenido del archivo de las propiedades de Bubble.io
    const result = JSON.parse(properties.result);  // El result del primer código debe ser pasado como una propiedad
    const fileContent = result.text;

    // Reemplazar con tu clave de API de OpenAI real
    const openaiApiKey = 'key';

    // Dividir el contenido del archivo en documentos más pequeños
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 0,
    });
    const documents = await splitter.splitDocuments([{ pageContent: fileContent, metadata: { source: "bubble.io" }}]);

    // Crear embeddings usando OpenAI
    const openaiEmbeddings = new OpenAIEmbeddings({ apiKey: openaiApiKey });
    const embeddings = await openaiEmbeddings.embedDocuments(documents.map(doc => doc.pageContent));

    // Detalles de Azure Cognitive Search
    const endpoint = "Azure_endpoint";
    const apiKey = "Azure_apiKey";
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
  } catch (error) {
    console.error(`An error occurred during document upload: ${error}`);
    throw error;
  }
}