// @ts-nocheck
import * as fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { getOpenAiEmbedding } from './shared';

const search_term = "scoliosis physical therapist, schroth method in california, san francisco, los angeles, sacramento, bay area";

// Read the input CSV file
const inputFilePath = './scoliosis2.csv';
const outputFilePath = './scoliosis2_sorted1.csv';

// Use the same output headers as before
const outputHeaders = ['First name', 'Last name', 'Email', 'Phone number', 'Title', 'Company', 'Location', 'Linkedin url', 'Last action', 'Time of last action', 'Company website', 'Linkedin public url', 'Title & Company', 'Embedding'];

// Create a CSV writer for the output file
const csvWriter = createObjectCsvWriter({ path: outputFilePath, header: outputHeaders.map(header => ({ id: header, title: header })) });

async function main() {
  // Get the embedding for the search term
  const searchTermEmbedding = await getOpenAiEmbedding(search_term);

  // Read and process the input CSV file
  const rows = await new Promise<any[]>(resolve => {
    const results = [];
    fs.createReadStream(inputFilePath)
      .pipe(csv({ headers: outputHeaders }))
      .on('data', row => {
        // Parse the stored embedding
        row.Embedding = row.Embedding.split(",").map(Number);

        // Calculate the similarity between the search term and the row embedding
        row.similarity = cosineSimilarity(searchTermEmbedding, row.Embedding);

        results.push({...row})
      })
      .on('end', () => {
        resolve(results);
      });
  });

  // Sort the rows based on the similarity
  rows.sort((a, b) => b.similarity - a.similarity);

  // Write the sorted rows to the output CSV file
  await csvWriter.writeRecords(rows);

  console.log('Sorting complete.');
}

main();

// Calculate the cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, aVal, idx) => sum + aVal * b[idx], 0);
  const aMagnitude = Math.sqrt(a.reduce((sum, aVal) => sum + aVal * aVal, 0));
  const bMagnitude = Math.sqrt(b.reduce((sum, bVal) => sum + bVal * bVal, 0));
  return dotProduct / (aMagnitude * bMagnitude);
}
