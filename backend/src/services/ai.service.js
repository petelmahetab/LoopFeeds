// ai.service.js
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ✅ Named export
export async function generateEmbedding(text) {
  try {
    const response = await ai.embeddings.create({
      model: 'gemini-2.5-small', // or any available embedding model
      input: text
    });
    return response.data[0].embedding; // returns the embedding vector
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}
