import { objectType } from 'nexus';
import { Context } from '../context';
import { Reward } from 'nexus-prisma';
import { RepositoryType } from './repository';
import { ContributorType } from './contributor';

export const RewardType = objectType({
  name: Reward.$name,
  description: Reward.$description,
  definition(t) {
    t.nonNull.field(Reward.id);
    t.nonNull.field(Reward.owner_github_id);
    t.nonNull.field(Reward.contributor_github_id);
    t.nonNull.field(Reward.repo_github_id);
    t.nonNull.field(Reward.pr_number);
    t.nonNull.field(Reward.secret);
    t.nonNull.field(Reward.amount_usd);
    t.nonNull.field(Reward.amount_eth);
    t.nonNull.field(Reward.created_at);
    t.nonNull.field(Reward.claimed);
    t.nonNull.field(Reward.claimed_at);
    t.nonNull.field(Reward.updated_at);

    t.field('repository', {
      type: RepositoryType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.repository.findUnique({
          where: {
            github_repo_id: parent.repo_github_id,
          },
        });
      },
    });
    t.field('contributor', {
      type: ContributorType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.contributor.findUnique({
          where: {
            github_id: parent.contributor_github_id,
          },
        });
      },
    });
  },
});
