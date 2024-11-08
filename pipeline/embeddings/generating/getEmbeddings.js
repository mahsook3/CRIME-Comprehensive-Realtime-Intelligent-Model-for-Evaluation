import { pipeline } from '@xenova/transformers';

// Function to generate embeddings for a given crime case
export async function getEmbedding(data) {
  if (typeof data !== 'string') {
    throw new Error('Input to getEmbedding must be a string');
  }

  const embedder = await pipeline(
    'feature-extraction', 
    'Xenova/nomic-embed-text-v1'
  );
  const results = await embedder(data, { pooling: 'mean', normalize: true });
  return Array.from(results.data);
}