/**
 * GitHub Comment Helper
 * Posts comments on Pull Requests using GitHub App authentication
 */

import { createAppJWT } from './utils';
import { callGeminiAPI } from './utils';
import { PROMPT_FOR_REWARD_COMMENT_GENERATION } from './prompts';

interface GitHubCommentResponse {
  id: number;
  html_url: string;
  body: string;
  created_at: string;
}

interface PostCommentParams {
  owner: string;
  repo: string;
  prNumber: number;
  commentBody: string;
  installationId: number;
}

/**
 * Fetch with timeout and retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      
      const isLastAttempt = attempt === maxRetries;
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = error instanceof Error && 
        (error.message.includes('fetch failed') || 
         error.message.includes('socket') ||
         error.message.includes('ECONNRESET'));

      if (isLastAttempt) {
        console.error(`[GitHub] Fetch failed after ${maxRetries} attempts:`, error);
        throw error;
      }

      if (isAbortError || isNetworkError) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(`[GitHub] Attempt ${attempt}/${maxRetries} failed, retrying in ${backoffMs}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        
        // Recreate abort controller for next attempt
        const newController = new AbortController();
        const newTimeoutId = setTimeout(() => newController.abort(), timeoutMs);
        controller.abort = newController.abort.bind(newController);
        clearTimeout(timeoutId);
      } else {
        throw error;
      }
    }
  }

  throw new Error('Fetch failed: max retries exceeded');
}

/**
 * Get an installation access token for the GitHub App
 */
async function getInstallationToken(installationId: number): Promise<string> {
  // Create JWT for the GitHub App
  const jwt = createAppJWT();

  // Exchange JWT for an installation access token with retry logic
  const response = await fetchWithRetry(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${jwt}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Connection': 'keep-alive',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to get installation token: ${error.message}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Post a comment on a GitHub Pull Request
 */
export async function postPRComment({
  owner,
  repo,
  prNumber,
  commentBody,
  installationId,
}: PostCommentParams): Promise<GitHubCommentResponse> {
  
  console.log(`[GitHub] Posting comment to ${owner}/${repo}#${prNumber}`);

  try {
    // Get installation access token
    const token = await getInstallationToken(installationId);

    // Post the comment using the installation token with retry logic
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          'User-Agent': 'ContriFlow-Bot',
          'Connection': 'keep-alive',
        },
        body: JSON.stringify({ body: commentBody }),
      },
      3, // maxRetries
      30000 // 30 second timeout
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`GitHub API error (${response.status}): ${error.message}`);
    }

    const data = await response.json();
    console.log(`[GitHub] ✅ Comment posted successfully: ${data.html_url}`);
    
    return data;

  } catch (error) {
    console.error('[GitHub] Failed to post comment:', error);
    throw error;
  }
}

/**
 * Generate comment content using Gemini AI
 */
export async function generateRewardCommentContent(
  contributorUsername: string,
  rewardAmount: string,
  rewardId: string,
  prNumber: number
): Promise<string> {
  
  // Format the prompt with actual values
  const prompt = PROMPT_FOR_REWARD_COMMENT_GENERATION
    .replace('[CONTRIBUTOR]', contributorUsername)
    .replace('[AMOUNT]', rewardAmount)
    .replace('[REWARD_ID]', rewardId)
    .replace('[PR_NUMBER]', prNumber.toString());

  try {
    console.log('[AI] Generating reward comment using Gemini...');
    
    // Call Gemini API using the shared utility function
    const generatedComment = await callGeminiAPI(prompt);

    console.log('[AI] Comment generated successfully');
    return generatedComment.trim();

  } catch (error) {
    console.error('[AI] Failed to generate comment with Gemini, using fallback template:', error);
    
    // Fallback to a template if AI fails
    return `
## 🎊 Reward Assigned!

Congratulations @${contributorUsername}! Your contribution to PR #${prNumber} has been recognized.

**Reward Details:**
- 💰 **Amount:** ${rewardAmount} tokens
- 🔢 **Reward ID:** \`${rewardId}\`

**To claim your reward:**
1. Visit the ContriFlow Dashboard
2. Connect your wallet
3. Navigate to "My Rewards" and claim reward \`${rewardId}\`

Your reward is being processed on-chain and will be claimable once confirmed! ⏳

---
_Posted automatically by ContriFlow 🤖_
    `.trim();
  }
}
