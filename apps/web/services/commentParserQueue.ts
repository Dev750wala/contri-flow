import { redisClient } from "@/lib/redisClient"
import { Job, Queue, Worker } from "bullmq"
import prisma from "@/lib/prisma"
import { parseComment, formatPrompt, generateSecret } from "@/lib/utils";
import { CommentParsingResponse, Sender as GitHubUserType } from '@/interfaces';

interface CommentParseJobData {
    commentBody: string;
    prNumber: number;
    contributorGithubId: number;
    commentorGithubId: number;
    commentorId: string;
    repositoryGithubId: number;
    repositoryId: string;
}

export const commentParseQueue = new Queue<CommentParseJobData, boolean, string>("COMMENT-PARSE-QUEUE", { connection: redisClient })

export const commentParseWorker = new Worker("COMMENT-PARSE-QUEUE", async (job: Job<CommentParseJobData, boolean, string>) => {
    const { commentBody, prNumber, repositoryId, commentorId } = job.data;

    const prompt = formatPrompt(commentBody);
    let aiRaw: CommentParsingResponse;

    try {
        aiRaw = await parseComment(prompt);
    } catch (err) {
        // ADD LOGGING OR STORE THIS ERROR IN DATABASE, AS THIS IS IMPORTANT PHASE OF THE FLOW
        console.error('AI returned invalid JSON', err);
        throw new Error('AI_PARSE_ERROR');
    }

    if (aiRaw) {
        const contributorFromGithub = await fetch(`https://api.github.com/users/${aiRaw.contributor}`, {
            headers: {
                Accept: "application/vnd.github+json",
            }
        }).then(res => res.json()) as GitHubUserType;

        if (!contributorFromGithub) {
            throw new Error('CONTRIBUTOR_NOT_FOUND');
        }

        const secret = generateSecret();

        await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { github_id: contributorFromGithub.id.toString() }
            })
            const contributor = await tx.contributor.upsert({
                where: {
                    github_id: contributorFromGithub.id.toString(),
                },
                update: {},
                create: {
                    github_id: contributorFromGithub.id.toString(),
                    ...(existingUser && { user_id: existingUser.id }),
                }
            })
            return await tx.reward.create({
                data: {
                    pr_number: prNumber,
                    secret,
                    tokenAmount: aiRaw.reward.toString(),
                    contributor_id: contributor.id,
                    repository_id: repositoryId,
                    issuer_id: commentorId,
                    comment: commentBody
                }
            })
        })
    }

    return true

    // await onChainQueue.add('send-onchain', { rewardId: rewardRow.id }, {
    //   jobId: `onchain:${rewardRow.id}`,
    //   attempts: 5,
    //   backoff: { type: 'exponential', delay: 1000 },
    //   removeOnComplete: true,
    // });

})

// commentParseWorker.run().catch(err => {
//     console.error('Failed to start comment parse worker:', err);
// });