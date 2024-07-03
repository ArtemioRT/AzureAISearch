const { SearchIndexClient, AzureKeyCredential } = require("@azure/search-documents");

const serviceName = "AzureEndpoint";
const apiKey = "AzureKey";

const indexName = "hotels-vector-quickstart";

const credential = new AzureKeyCredential(apiKey);
const client = new SearchIndexClient(serviceName, indexName, credential);

const indexSchema = {
    name: indexNames,
    fields: [
        {
            name: "HotelId",
            type: "Edm.String",
            searchable: false,
            filterable: true,
            retrievable: true,
            sortable: false,
            facetable: false,
            key: true
        },
        {
            name: "HotelName",
            type: "Edm.String",
            searchable: true,
            filterable: false,
            retrievable: true,
            sortable: true,
            facetable: false
        },
        {
            name: "HotelNameVector",
            type: "Collection(Edm.Single)",
            searchable: true,
            retrievable: true,
            dimensions: 1536,
            vectorSearchProfile: "my-vector-profile"
        },
        {
            name: "Description",
            type: "Edm.String",
            searchable: true,
            filterable: false,
            retrievable: true,
            sortable: false,
            facetable: false
        },
        {
            name: "DescriptionVector",
            type: "Collection(Edm.Single)",
            searchable: true,
            retrievable: true,
            dimensions: 1536,
            vectorSearchProfile: "my-vector-profile"
        },
        {
            name: "Category",
            type: "Edm.String",
            searchable: true,
            filterable: true,
            retrievable: true,
            sortable: true,
            facetable: true
        }
    ],
    vectorSearch: {
        algorithms: [
            {
                name: "my-hnsw-vector-config-1",
                kind: "hnsw",
                hnswParameters: {
                    m: 4,
                    efConstruction: 400,
                    efSearch: 500,
                    metric: "cosine"
                }
            }
        ],
        profiles: [
            {
                name: "my-vector-profile",
                algorithm: "my-hnsw-vector-config-1"
            }
        ]
    }
};

async function createIndex() {
    try {
        await client.createIndex(indexSchema);
        console.log("Index created successfully");
    } catch (error) {
        console.error("Error creating index:", error);
    }
}

createIndex();

