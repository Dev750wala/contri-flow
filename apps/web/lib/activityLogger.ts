import prisma from './prisma';
import { ActivityType, Prisma } from '@prisma/client';

interface ActivityLogParams {
  organizationId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  repositoryId?: string;
  rewardId?: string;
  actorId?: string;
  actorName?: string;
  amount?: string;
  prNumber?: number;
  issueNumber?: number;
}

/**
 * Logs an activity to the Activity table
 * This function should be called after any significant database operation
 */
export async function logActivity(params: ActivityLogParams) {
  try {
    await prisma.activity.create({
      data: {
        organization_id: params.organizationId,
        activity_type: params.activityType,
        title: params.title,
        description: params.description,
        metadata: params.metadata as Prisma.JsonValue,
        repository_id: params.repositoryId,
        reward_id: params.rewardId,
        actor_id: params.actorId,
        actor_name: params.actorName,
        amount: params.amount,
        pr_number: params.prNumber,
        issue_number: params.issueNumber,
      },
    });
    console.log(`[ActivityLogger] Activity logged: ${params.activityType} - ${params.title}`);
  } catch (error) {
    // Log error but don't throw to prevent breaking the main flow
    console.error('[ActivityLogger] Failed to log activity:', error);
  }
}

/**
 * Logs multiple activities in a transaction
 */
export async function logActivities(activities: ActivityLogParams[]) {
  try {
    await prisma.$transaction(
      activities.map((params) =>
        prisma.activity.create({
          data: {
            organization_id: params.organizationId,
            activity_type: params.activityType,
            title: params.title,
            description: params.description,
            metadata: params.metadata as Prisma.JsonValue,
            repository_id: params.repositoryId,
            reward_id: params.rewardId,
            actor_id: params.actorId,
            actor_name: params.actorName,
            amount: params.amount,
            pr_number: params.prNumber,
            issue_number: params.issueNumber,
          },
        })
      )
    );
    console.log(`[ActivityLogger] ${activities.length} activities logged`);
  } catch (error) {
    console.error('[ActivityLogger] Failed to log activities:', error);
  }
}
