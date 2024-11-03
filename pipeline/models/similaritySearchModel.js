import { MongoClient } from "mongodb";
import { getEmbedding } from "../embeddings/generating/getEmbeddings.js";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

async function connectClient() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
}

async function search(query) {
  if (!query) {
    throw new Error("Query is required");
  }

  try {
    await connectClient();
    const database = client.db("test");
    const collection = database.collection("crimeCases");

    const queryEmbedding = await getEmbedding(query);

    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          exact: true,
          limit: 5,
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          sub_category: 1,
          crimecase: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const result = collection.aggregate(pipeline);
    const results = [];
    for await (const doc of result) {
      results.push(doc);
    }

    return results;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while processing your request");
  }
}

export { search };