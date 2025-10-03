// import { Worker } from 'bullmq';
// import prisma from '@/lib/prisma';
// import { commentParseQueue, onChainQueue } from '../lib/queues';
// import { callAiExtractor, formatPrompt } from '@/lib/utils';
// import { CommentParsingResponse, Sender as GitHubUserType } from '@/interfaces';

// const connection = { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT || 6379) };

// const worker = new Worker('parse-comment', async (job) => {
//   const { repositoryGithubId, prNumber, comment, issuerGithubId } = job.data as {
//     repositoryGithubId: string; prNumber: number; comment: string; issuerGithubId?: string;
//   };

//   const prompt = formatPrompt(comment);
//   let aiRaw: CommentParsingResponse;

//   try {
//     aiRaw = await callAiExtractor(prompt);
//   } catch (err) {
//     // ADD LOGGING OR STORE THIS ERROR IN DATABASE, AS THIS IS IMPORTANT PHASE OF THE FLOW
//     console.error('AI returned invalid JSON', err);
//     throw new Error('AI_PARSE_ERROR');
//   }

//   if (aiRaw) {
//     const contributorFromGithub = await fetch(`https://api.github.com/users/${aiRaw.contributor}`, {
//       headers: {
//         Accept: "application/vnd.github+json",
//       }
//     }).then(res => res.json()) as GitHubUserType;

//     if (!contributorFromGithub) {
//       throw new Error('CONTRIBUTOR_NOT_FOUND');
//     }

//     // if

//     const newReward = await prisma.$transaction(async (tx) => {
//       const existingUser = await tx.user.findUnique({
//         where: { github_id: contributorFromGithub.id.toString() }
//       })
//       const contributor = await tx.contributor.upsert({
//         where: {
//           github_id: contributorFromGithub.id.toString(),
//         },
//         update: {},
//         create: {
//           github_id: contributorFromGithub.id.toString(),
//           ...(existingUser && { user_id: existingUser.id }),
//         }
//       })
//       // return await tx.reward.create({
        
//       // })
//     })
//     // const newReward = await prisma.reward.create({
//     //   data: {

//     //   }
//     // })
//   }

//   // await onChainQueue.add('send-onchain', { rewardId: rewardRow.id }, {
//   //   jobId: `onchain:${rewardRow.id}`,
//   //   attempts: 5,
//   //   backoff: { type: 'exponential', delay: 1000 },
//   //   removeOnComplete: true,
//   // });

// }, { connection, concurrency: 4 });

// worker.on('failed', (job, err) => {
//   console.error('parse job failed', job?.id, err);
// });
