import { IssueCommentEventInterface } from '@/interfaces';
import { ControllerReturnType } from '../../../interface';
import prisma from '@/lib/prisma';
import { commentParseQueue } from '@/services/commentParserQueue';
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
    sender: { id: sender_github_id },  // The person who comments for issuing reward.
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
    console.log(repository.id, contributor_github_id)
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
  const job = await commentParseQueue.add(
    'parse-comment',
    {
      commentBody,
      prNumber: pr_number,
      contributorGithubId: contributor_github_id,
      commentorGithubId: commentor_github_id,
      repositoryGithubId: repository_github_id,
      repositoryId: repository.id,
      commentorId: issuar.id,
    },
    {
      attempts: 1,
    }
  );
  console.log(`[Controller] Job ${job.id} added to queue successfully`);

  return {
    message: 'Comment parsing job added to queue',
    statusCode: 200,
    success: true,
    data: null,
  };
}
