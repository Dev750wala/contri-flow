import { NextResponse } from 'next/server';
import { getCommentParseWorker } from '@/services/commentParserQueue';
import { getCommentParseQueue } from '@/services/commentParserQueue';
import { isBullMQRedisHealthy } from '@/lib/redisClient';

export async function GET() {
  try {
    const redisHealthy = isBullMQRedisHealthy();

    let workerStatus = null;
    let queueStatus = null;

    if (redisHealthy) {
      try {
        const worker = getCommentParseWorker();
        const queue = getCommentParseQueue();

        workerStatus = {
          isRunning: worker.isRunning(),
          name: worker.name,
          isPaused: worker.isPaused(),
        };

        const [waiting, active, completed, failed, delayed] = await Promise.all(
          [
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
          ]
        );

        queueStatus = {
          waiting,
          active,
          completed,
          failed,
          delayed,
          total: waiting + active + completed + failed + delayed,
        };
      } catch (error) {
        workerStatus = {
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return NextResponse.json({
      redis: {
        healthy: redisHealthy,
      },
      worker: workerStatus,
      queue: queueStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get worker status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
