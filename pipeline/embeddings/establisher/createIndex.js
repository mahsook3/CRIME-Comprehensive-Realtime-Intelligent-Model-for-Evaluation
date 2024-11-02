import { MongoClient } from 'mongodb';
import dotenv from "dotenv";

dotenv.config();


const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

async function run() {
  try {
    const database = client.db("test");
    const collection = database.collection("crimeCases");

    const index = {
        name: "vector_index",
        type: "vectorSearch",
        definition: {
          "fields": [
            {
              "type": "vector",
              "path": "embedding",
              "similarity": "euclidean",
              "numDimensions": 768
            }
          ]
        }
    };

    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
