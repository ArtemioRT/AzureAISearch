# Vector search with azure ai search
This project creates a vector search service using Azure AI Search.

## Requirements

1. Node.js (latest version recommended)
2. Search service:
   AzureEndpoint:It is the url of search service
   AzureKey:It is the primary admin key search service
3. Group

### Dependencies
The project dependencies are listed in the `package.json` file as follows:

```json
{
  "dependencies": {
    "mammoth": "latest",
    "pdf.js-extract": "latest",
    "@azure/search-documents": "latest",
    "@langchain/textsplitters": "latest",
    "@langchain/openai": "latest",
    "@langchain/core": "~0.2.0",
    "langchainhub": "~0.0.8",
    "openapi-types": "^12.1.3",
    "langchain": "0.2.7"
  }
}


