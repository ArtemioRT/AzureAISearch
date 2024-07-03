async function(properties, context) {
  try {
    // Import necessary modules
    const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');
    const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
    const { OpenAIEmbeddings } = require('@langchain/openai');
    
    // Get text file content from Bubble.io properties
    const fileContent = properties.fileContent;
    
    // Replace with your actual OpenAI API key
    const openaiApiKey = 'Key';
    
    // Split file content into smaller documents
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 0,
    });
    const documents = await splitter.splitDocuments([{ pageContent: fileContent, metadata: { source: "bubble.io" }}]);
    
    // Create embeddings using OpenAI
    const openaiEmbeddings = new OpenAIEmbeddings({ apiKey: openaiApiKey });
    const embeddings = await openaiEmbeddings.embedDocuments(documents.map(doc => doc.pageContent));
    
    // Azure Cognitive Search details
    const endpoint = "AzureEndpoint";
    const apiKey = "AzureKey";
    const indexName = "hotels-vector-quickstar";
    
    // Configure search client
    const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));
    
    // Prepare documents for Azure Cognitive Search
    const azureDocuments = documents.map((doc, index) => ({
      '@search.action': 'upload',
      HotelId: `doc-${index}`, // Use HotelId as the key field
      HotelName: `Document ${index}`, // Placeholder for HotelName
      Description: doc.pageContent,
      DescriptionVector: embeddings[index],
      Category: 'Document', // Placeholder for Category
      Tags: ['uploaded'], // Placeholder for Tags
      ParkingIncluded: false, // Placeholder
      LastRenovationDate: new Date().toISOString(), // Current date as placeholder
      Rating: 0, // Placeholder
      Address: { // Placeholder for Address
        StreetAddress: '',
        City: '',
        StateProvince: '',
        PostalCode: '',
        Country: ''
      },
      Location: null // Placeholder for Location
    }));
    
    if (azureDocuments.length === 0) {
      throw new Error("No documents found to index.");
    }
    
    // Upload documents to Azure Cognitive Search index
    const batch = await client.uploadDocuments(azureDocuments);
    console.log(`${batch.results.length} documents uploaded successfully to Azure Cognitive Search.`);
    
    // Return success message
    return `${batch.results.length} documents uploaded successfully to Azure Cognitive Search.`;
  } catch (error) {
    console.error(`An error occurred during document upload: ${error}`);
    throw error;
  }
}
