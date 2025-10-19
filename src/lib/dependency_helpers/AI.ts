import { config } from "../config";

import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';

export async function getGeminiJsonResponse(prompt: string, num_iter: number = 2): Promise<string | null> {
  // Try at max num_iter times
  for (let iter = 0; iter < num_iter; iter++) {
    const response = await getGeminiResponse(prompt);
    const jsonData = extractJson(response);

    // If valid JSON & valid searchQuery -> return
    if (jsonData && typeof jsonData.data === 'string' && jsonData.data.trim() !== '') {
      return jsonData.data.trim();
    }
  }

  return null;
}

export async function getGeminiResponse(prompt: string): Promise<string> {
  // Initialize with explicit credentials
  const vertexAI = new VertexAI({
    project: config.google.project_id, // Your GCP project ID
    location: 'us-central1',
    googleAuthOptions: {
      keyFilename: path.join(process.cwd(), 'service-account-key.json'),
    },
  });

  const model = vertexAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
  });

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log(`AI RESPONSE: ${prompt.slice(0, 15)} -> ${text}`);
    return text;
  } catch (error) {
    console.error(`lib/dependency/ai getGeminiResponse error: ${error}`);
    return '';
  }
}

export async function getGeminiDependencyName(input: string): Promise<string> {
  const prompt = `Given this dependency: ${input}, generate the best fitting name for that dependency

Return ONLY valid JSON in this exact format:
{"data": "your dependency name here"}

No explanations, no markdown, just the JSON.`
  
  return await getGeminiJsonResponse(prompt) || input.slice(0, 15);
}

export function extractJson(response: string): any {
  // Try direct parsing
  try {
    return JSON.parse(response);
  } catch {}

  // Try finding JSON, then parsing
  const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    console.log('lib/ai/extractJson error: No JSON Match found');
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.log(`lib/ai/extractJson error: Found JSON-like content but failed to parse: ${error}`);
  }
}