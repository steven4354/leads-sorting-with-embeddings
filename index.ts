import { Configuration, OpenAIApi } from "openai";
import * as fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import { EventEmitter } from "events";
import { getOpenAiEmbedding } from "./shared";

// dotenv
require("dotenv").config();

// Create a custom event emitter
const customEmitter = new EventEmitter();

// Specify the path to your input CSV file
const inputFilePath = "./scoliosis.csv";

// Specify the path to your output CSV file
const outputFilePath = "./scoliosis2.csv";

// Define the header names for the input and output CSV files
const inputHeaders = [
  "First name",
  "Last name",
  "Email",
  "Phone number",
  "Title",
  "Company",
  "Location",
  "Linkedin url",
  "Last action",
  "Time of last action",
  "Company website",
  "Linkedin public url",
];
const outputHeaders = [...inputHeaders, "Title & Company", "Embedding"];

// Create a stream to read the input CSV file
const inputStream = fs
  .createReadStream(inputFilePath)
  .pipe(csv({ headers: inputHeaders }));

// Create an object CSV writer for the output CSV file
const csvWriter = createObjectCsvWriter({
  path: outputFilePath,
  header: outputHeaders.map(header => ({ id: header, title: header })),
});

// Initialize an array to store the output rows
const outputRows = [];



// Initialize a counter to keep track of the processed rows
let processedRows = 0;
let totalRows = 0;

// Listen for the 'data' event to process each row of the CSV file
inputStream.on("data", async (row) => {
  totalRows++;

  // Combine the Title and Company columns
  const titleAndCompany = `${row.Title} at ${row.Company}`;

  // Generate the OpenAI embedding for the combined Title and Company
  const embedding = await getOpenAiEmbedding(titleAndCompany);

  console.log("Embed 1 row: ", embedding);

  // Add the combined Title and Company and the embedding to the output row
  const outputRow = {
    ...row,
    "Title & Company": titleAndCompany,
    Embedding: embedding,
  };

  // Store the output row in the outputRows array
  // @ts-ignore
  outputRows.push(outputRow);

  // Increment the processedRows counter
  processedRows++;

  // Emit the custom 'rowProcessed' event
  customEmitter.emit("rowProcessed");
});

// Listen for the 'rowProcessed' event
customEmitter.on("rowProcessed", async () => {
  if (processedRows === totalRows) {
    // Write the output rows to the output CSV file
    // @ts-ignore
    await csvWriter.writeRecords(outputRows);

    console.log("CSV file processing complete.");
  }
});

