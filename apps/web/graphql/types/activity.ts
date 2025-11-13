import { objectType, enumType } from 'nexus';
import { Activity } from 'nexus-prisma';
import { Context } from '../context';
import { Activity as ActivityPrisma } from '@prisma/client';

export const ActivityTypeEnum = enumType({
  name: 'ActivityType',
  members: [
    'DEPOSIT',
    'REWARD_ISSUED',
    'REWARD_CLAIMED',
    'PR_MERGED',
    'ISSUE_CREATED',
    'ISSUE_CLOSED',
    'REPO_ADDED',
    'REPO_REMOVED',
    'REWARDS_ENABLED',
    'REWARDS_DISABLED',
    'MAINTAINER_ADDED',
    'MAINTAINER_REMOVED',
    'APP_INSTALLED',
    'APP_UNINSTALLED',
    'ORG_SUSPENDED',
    'ORG_REACTIVATED',
  ],
});

export const ActivityType = objectType({
  name: Activity.$name,
  description: 'Activity log entry for organization events',
  definition(t) {
    t.nonNull.field(Activity.id);
    t.nonNull.field(Activity.activity_type.name, { type: ActivityTypeEnum });
    t.nonNull.field(Activity.title);
    t.field(Activity.description);

    t.field(Activity.repository_id);
    t.field(Activity.reward_id);
    t.field(Activity.actor_id);
    t.field(Activity.actor_name);

    t.field(Activity.amount);
    t.field(Activity.pr_number);
    t.field(Activity.issue_number);

    t.nonNull.field(Activity.created_at);

    t.field('organization', {
      type: 'Organization',
      resolve: async (parent: ActivityPrisma, _args, ctx: Context) => {
        return await ctx.prisma.organization.findUnique({
          where: { id: parent.organization_id },
        });
      },
    });
  },
});
