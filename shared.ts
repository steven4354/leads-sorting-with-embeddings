
import { Configuration, OpenAIApi } from "openai";

// dotenv
require("dotenv").config();

// Initialize the OpenAI API client with your API key
const configuration = new Configuration({
    apiKey: process.env["openai_key"],
  });
const openai = new OpenAIApi(configuration);

// Generate the OpenAI embedding for a text string
export async function getOpenAiEmbedding(text: string): Promise<number[]> {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });
  
    // log response
    console.log("Response: ", response.data);
  
    if (response.status === 200) {
      // extract the embedding from response.data
      // data: [ { object: 'embedding', index: 0, embedding: [Array] } ]
      return response.data.data[0].embedding;
    } else {
      throw new Error(`Failed to generate OpenAI embedding for text "${text}"`);
    }
  }
  