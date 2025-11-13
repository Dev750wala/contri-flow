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
 * Get an installation access token for the GitHub App
 */
async function getInstallationToken(installationId: number): Promise<string> {
  // Create JWT for the GitHub App
  const jwt = createAppJWT();

  // Exchange JWT for an installation access token
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${jwt}`,
        'X-GitHub-Api-Version': '2022-11-28',
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

    // Post the comment using the installation token
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'ContriFlow-Bot',
      },
      body: JSON.stringify({ body: commentBody }),
    });

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
