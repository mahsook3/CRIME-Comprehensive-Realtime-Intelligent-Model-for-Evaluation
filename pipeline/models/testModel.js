import { MongoClient } from "mongodb";
import { getEmbedding } from "../embeddings/generating/getEmbeddings.js";
import csv from "csv-parser";
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

async function connectClient() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
}

async function predictFile(filePath) {
  if (!filePath) {
    throw new Error("CSV file path is required");
  }

  const results = [];
  const stream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        const finalResults = [];

        for (const row of results) {
          const query = row.crimeaditionalinfo;

          if (!query) {
            row.predictedcategory = "No data found";
            row.predictedsub_category = "No data found";
            finalResults.push(row);
            continue;
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
                  limit: 1,
                },
              },
              {
                $project: {
                  _id: 0,
                  category: 1,
                  sub_category: 1,
                  score: { $meta: "vectorSearchScore" },
                },
              },
            ];

            const result = collection.aggregate(pipeline);
            const predictions = [];

            for await (const doc of result) {
              predictions.push(doc);
            }

            if (predictions.length > 0) {
              row.predictedcategory = predictions[0].category;
              row.predictedsub_category = predictions[0].sub_category;
            } else {
              row.predictedcategory = "No data found";
              row.predictedsub_category = "No data found";
            }
          } catch (error) {
            console.error(error);
            row.predictedcategory = "Error";
            row.predictedsub_category = "Error";
          }

          finalResults.push(row);
        }

        resolve(finalResults);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

export { predictFile };