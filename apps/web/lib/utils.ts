import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PROMPT_FOR_JSON_IN_SINGLE_LINE_FORMAT } from './prompts';
import { CommentParsingResponse } from '@/interfaces';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrompt(input: string) {
  return `
    ${PROMPT_FOR_JSON_IN_SINGLE_LINE_FORMAT}

    COMMENT: ${input}
  `
}

export async function callAiExtractor(prompt: string): Promise<CommentParsingResponse> {
  const response = await fetch(`${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
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