import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PROMPT_FOR_JSON_IN_SINGLE_LINE_FORMAT } from './prompts';
import { CommentParsingResponse } from '@/interfaces';
import config from '@/config';
import jwt from "jsonwebtoken";

interface GeminiAPIResponse {
  candidates: {
    content: {
      parts: {
        text: string; // JSON string containing contributor and reward
      }[];
      role: string;
    };
    finishReason: string;
    avgLogprobs: number;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    promptTokensDetails: {
      modality: string;
      tokenCount: number;
    }[];
    candidatesTokensDetails: {
      modality: string;
      tokenCount: number;
    }[];
  };
  modelVersion: string;
  responseId: string;
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fetch with timeout and retry logic for resilient HTTP requests
 * Handles network errors, timeouts, and socket errors with exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  timeoutMs: number = 30000
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        // @ts-ignore - Node.js fetch options
        keepalive: true,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const isLastAttempt = attempt === maxRetries;
      const isAbortError = lastError.name === 'AbortError';
      const isNetworkError = 
        lastError.message.includes('fetch failed') || 
        lastError.message.includes('socket') ||
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        lastError.message.includes('closed');

      if (isLastAttempt) {
        console.error(`[FetchRetry] Failed after ${maxRetries} attempts for ${url}:`, lastError);
        throw lastError;
      }

      if (isAbortError || isNetworkError) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(
          `[FetchRetry] Attempt ${attempt}/${maxRetries} failed for ${url}, retrying in ${backoffMs}ms...`,
          { error: lastError.message }
        );
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      } else {
        // Non-retryable error
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Fetch failed: max retries exceeded');
}

export function formatPrompt(input: string) {
  return `
    ${PROMPT_FOR_JSON_IN_SINGLE_LINE_FORMAT}

    COMMENT: ${input}
  `
}

/**
 * Generic function to call Gemini API with any prompt
 * Returns the raw text response from Gemini
 */
export async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const payload = {
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await fetchWithRetry(
      `${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      3,
      30000
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API failed with status:', response.status, errorText);
      throw new Error(`Gemini API failed with status: ${response.status}, Error: ${errorText}`);
    }

    const rawResponse = await response.text();
    console.log('Raw Gemini response:', rawResponse);

    let data: GeminiAPIResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (err) {
      console.error('Failed to parse Gemini response as JSON:', rawResponse);
      throw new Error('Gemini API returned invalid JSON');
    }

    // Ensure valid response structure
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates found in the Gemini response:', data);
      throw new Error('Gemini response does not contain valid candidates');
    }

    // Get the first candidate's content
    const candidateContent = data.candidates[0].content;
    if (candidateContent.parts && candidateContent.parts.length > 0) {
      return candidateContent.parts[0].text;
    } else {
      throw new Error('Gemini response content is missing expected parts.');
    }

  } catch (err) {
    console.error('Error in Gemini API call:', err);
    throw err;
  }
}

/**
 * Parse comment using Gemini AI to extract contributor and reward
 */
export async function parseComment(prompt: string): Promise<CommentParsingResponse> {
  try {
    const responseText = await callGeminiAPI(prompt);
    
    // Parse the JSON response from Gemini
    const parsedContent = JSON.parse(responseText);

    // Return the parsed content in the desired format
    return {
      contributor: parsedContent.contributor,
      reward: parsedContent.reward,
    };

  } catch (err) {
    console.error('Error in parsing comment:', err);
    throw new Error('AI_PARSE_ERROR');
  }
}



export function generateSecret() {
  return Array.from(Array(100), () => Math.floor(Math.random() * 36).toString(36)).join('');
}

function getPrivateKeyFromB64(b64?: string): string {
  if (!b64) throw new Error("Missing GITHUB_PRIVATE_KEY_B64");

  let key = Buffer.from(b64, "base64").toString("utf8");
  key = key.replace(/\r\n/g, "\n");

  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");

  key = key.trim().replace(/^["']|["']$/g, "");

  if (!/^-----BEGIN [A-Z ]+-----/.test(key) || !/-----END [A-Z ]+-----\s*$/.test(key)) {
    throw new Error("Decoded key does not look like a valid PEM private key");
  }

  return key;
}

export function createAppJWT(appIdEnv?: string, privateKeyB64Env?: string) {
  const appId = appIdEnv ?? process.env.GITHUB_APP_ID;
  const b64 = privateKeyB64Env ?? process.env.GITHUB_PRIVATE_KEY_B64;
  if (!appId) throw new Error("Missing GITHUB_APP_ID");
  if (!b64) throw new Error("Missing GITHUB_PRIVATE_KEY_B64");

  const privateKey = getPrivateKeyFromB64(b64);
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iat: now - 10,        
    exp: now + 60 * 9,
    iss: appId,
  };

  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return token;
}
