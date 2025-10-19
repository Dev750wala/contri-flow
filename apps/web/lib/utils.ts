import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PROMPT_FOR_JSON_IN_SINGLE_LINE_FORMAT } from './prompts';
import { CommentParsingResponse } from '@/interfaces';
import config from '@/config';
import jwt from "jsonwebtoken";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrompt(input: string) {
  return `
    ${PROMPT_FOR_JSON_IN_SINGLE_LINE_FORMAT}

    COMMENT: ${input}
  `
}

export async function parseComment(prompt: string): Promise<CommentParsingResponse> {
  const response = await fetch(`${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('AI extraction failed');
  }

  const data = await response.json();

  if (!data || typeof JSON.parse(data) !== 'object') {
    throw new Error('Invalid AI extraction response');
  }
  return JSON.parse(data) as CommentParsingResponse;
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
