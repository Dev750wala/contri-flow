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

export const commentParseWorker = new Worker("COMMENT-PARSE-QUEUE", async (job: Job<CommentParseJobData, void, string>) => {
    // TODO MAKE A WORKER TO PROCESS THIS JOB TO STORE THE VOUCHER ON THE CHAIN.

})