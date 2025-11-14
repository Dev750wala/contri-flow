import { NextResponse } from 'next/server';
import { commentParseWorker, commentParseQueue } from '@/services/commentParserQueue';
import { bullMQRedisClient } from '@/lib/redisClient';

export async function GET() {
  try {
    const redisHealthy = bullMQRedisClient.status === 'ready';

    let workerStatus = null;
    let queueStatus = null;

    if (redisHealthy) {
      try {
        workerStatus = {
          isRunning: commentParseWorker.isRunning(),
          name: commentParseWorker.name,
          isPaused: commentParseWorker.isPaused(),
        };

        const [waiting, active, completed, failed, delayed] = await Promise.all([
          commentParseQueue.getWaitingCount(),
          commentParseQueue.getActiveCount(),
          commentParseQueue.getCompletedCount(),
          commentParseQueue.getFailedCount(),
          commentParseQueue.getDelayedCount(),
        ]);

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
