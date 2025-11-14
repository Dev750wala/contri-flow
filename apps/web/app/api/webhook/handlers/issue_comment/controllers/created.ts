import { IssueCommentEventInterface } from '@/interfaces';
import { ControllerReturnType } from '../../../interface';
import prisma from '@/lib/prisma';
import { getCommentParseQueue } from '@/services/commentParserQueue';
import { Repository, RepositoryMaintainer } from '@prisma/client';

export async function handleIssueCommentCreated(
  body: IssueCommentEventInterface
): Promise<ControllerReturnType> {
  console.log('body: ', JSON.stringify(body));
  const {
    issue: {
      number: pr_number,
      // state,
      user: { id: contributor_github_id },
      pull_request: { merged_at },
    },
    comment: {
      body: commentBody,
      user: { id: commentor_github_id },
    },
    repository: { id: repository_github_id },
    sender: { id: sender_github_id }, // The person who comments for issuing reward.
    installation: { id: installation_id },
  } = body;

  if (!merged_at) {
    return {
      message: 'Pull request is not merged',
      statusCode: 200,
      success: false,
      data: "I don't know",
    };
  }

  let repository: Repository | null;
  let issuar: RepositoryMaintainer | null;
  const transactionResult = await prisma.$transaction(async (tx) => {
    repository = await tx.repository.findUnique({
      where: {
        github_repo_id: repository_github_id.toString(),
      },
    });
    if (!repository) {
      return {
        message: 'Repository not found',
        statusCode: 404,
        success: false,
        error: 'The repository was not found',
      };
    }
    const rewardExists = await tx.reward.findUnique({
      where: {
        repository_id_pr_number: {
          repository_id: repository.id,
          pr_number,
        },
      },
    });
    if (rewardExists) {
      return {
        message: 'Reward already exists for this PR',
        statusCode: 200,
        success: false,
        data: rewardExists,
      };
    }
    console.log(repository.id, contributor_github_id);
    issuar = await tx.repositoryMaintainer.findUnique({
      where: {
        repository_id_github_id: {
          repository_id: repository.id,
          github_id: sender_github_id.toString(),
        },
      },
    });
    if (!issuar) {
      return {
        message: 'User is not a maintainer of this repository',
        statusCode: 403,
        success: false,
        error: 'User is not a maintainer',
      };
    }
    return null;
  });

  // If transaction returned an error response, return it
  if (transactionResult) {
    return transactionResult;
  }

  // Validate that we have the required data
  if (!repository || !issuar) {
    return {
      message: 'Failed to retrieve repository or maintainer information',
      statusCode: 500,
      success: false,
      error: 'Internal server error',
    };
  }

  console.log('[Controller] Adding job to commentParseQueue');
  
  try {
    // Use lazy getter to avoid blocking on Redis connection
    const queue = getCommentParseQueue();
    
    // Ensure worker is initialized
    const { getCommentParseWorker } = await import('@/services/commentParserQueue');
    const worker = getCommentParseWorker();
    console.log('[Controller] Worker status:', {
      isRunning: worker.isRunning(),
      name: worker.name,
    });
    
    const job = await queue.add(
      'parse-comment',
      {
        commentBody,
        prNumber: pr_number,
        contributorGithubId: contributor_github_id.toString(),
        commentorGithubId: commentor_github_id.toString(),
        repositoryGithubId: repository_github_id.toString(),
        repositoryId: repository.id,
        commentorId: issuar.id,
        installationId: installation_id,
      },
      {
        attempts: 1,
      }
    );
    console.log(`[Controller] Job ${job.id} added to queue successfully`);
    console.log(`[Controller] Job details:`, {
      id: job.id,
      name: job.name,
      data: {
        prNumber: pr_number,
        repositoryId: repository.id,
        contributorGithubId: contributor_github_id.toString(),
      },
    });

    return {
      message: 'Comment parsing job added to queue',
      statusCode: 200,
      success: true,
      data: null,
    };
  } catch (error) {
    console.error('[Controller] Failed to add job to queue:', error);
    
    // Return success to GitHub even if queue fails
    // This prevents webhook retries and allows manual processing later
    return {
      message: 'Webhook received, job queuing failed but will be retried',
      statusCode: 200,
      success: true,
      data: null,
    };
  }
}
