import { MongoClient } from 'mongodb'; 
import { getEmbedding } from '../generating/getEmbeddings.js';
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

// Function to process and update embeddings in batches
async function processBatch(batchSize = 30) {
    const db = client.db("test");
    const collection = db.collection("crimeCases");
    let updatedDocCount = 0;
    let remainingDocuments = true;

    // Calculate total number of documents
    const totalDocuments = await collection.countDocuments();
    console.log(`Total number of documents: ${totalDocuments}`);

    // Calculate number of documents with embeddings
    const documentsWithEmbedding = await collection.countDocuments({ "embedding": { "$exists": true, "$ne": null } });
    console.log(`Number of documents with embeddings: ${documentsWithEmbedding}`);

    // Calculate number of documents without embeddings
    const documentsWithoutEmbedding = await collection.countDocuments({ 
        "$or": [
            { "embedding": { "$exists": false } },
            { "embedding": null }
        ]
    });
    console.log(`Number of documents without embeddings: ${documentsWithoutEmbedding}`);

    while (remainingDocuments) {
        const filter = { 
            "crimecase": { "$nin": [null, ""] },
            "$or": [
                { "embedding": { "$exists": false } },
                { "embedding": null }
            ]
        };

        // Fetch a batch of documents
        const documents = await collection.find(filter).limit(batchSize).toArray();
        if (documents.length === 0) {
            remainingDocuments = false; // Stop if no more documents left
            break;
        }

        console.log(`Processing batch of ${documents.length} documents...`);

        // Process each document concurrently
        const updatePromises = documents.map(async (doc) => {
            console.log(`Processing document with _id: ${doc._id}`);
            try {
                const embedding = await getEmbedding(doc.crimecase);
                console.log(doc.crimecase)
                const result = await collection.updateOne(
                    { "_id": doc._id },
                    { "$set": { "embedding": embedding } }
                );

                if (result.modifiedCount > 0) {
                    updatedDocCount += 1;
                    console.log(`Updated document with _id: ${doc._id}`);
                } else {
                    console.log(`Failed to update document with _id: ${doc._id}`);
                }
            } catch (error) {
                console.log(`Error processing document with _id: ${doc._id}`, error);
            }
        });

        // Wait for all updates in the batch to complete
        await Promise.all(updatePromises);

        console.log(`Finished processing batch. Total documents updated so far: ${updatedDocCount}`);
    }

    console.log("Total count of documents updated:", updatedDocCount);
}

async function run() {
    try {
        await client.connect();
        console.log("Generating embeddings for crime cases...");
        await processBatch(); // Start batch processing
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);