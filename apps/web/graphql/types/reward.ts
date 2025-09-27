import { objectType } from 'nexus';
import { Context } from '../context';
import { Reward } from 'nexus-prisma';
import { RepositoryType } from './repository';
import { ContributorType } from './contributor';
import { RepositoryMaintainerType } from './repository-maintainer';
import { Reward as RewardPrisma } from '@prisma/client';

export const RewardType = objectType({
  name: Reward.$name,
  description: Reward.$description,
  definition(t) {
    t.nonNull.field(Reward.id);
    t.nonNull.field(Reward.pr_number);
    t.nonNull.field(Reward.secret);
    t.nonNull.field(Reward.created_at);
    t.nonNull.field(Reward.claimed);
    t.field(Reward.claimed_at);
    t.nonNull.field(Reward.updated_at);
    t.field(Reward.tx_hash);
    t.field(Reward.destination_address);

    t.nonNull.field(Reward.issuer.name, {
      type: RepositoryMaintainerType,
      async resolve(parent: RewardPrisma, _args, ctx: Context) {
        return await ctx.prisma.repositoryMaintainer.findUnique({
          where: {
            id: parent.issuer_id,
          },
        });
      },
    });

    t.field('repository', {
      type: RepositoryType,
      resolve(parent: RewardPrisma, _args, ctx: Context) {
        return ctx.prisma.repository.findUnique({
          where: {
            id: parent.repository_id,
          },
        });
      },
    });
    t.field('contributor', {
      type: ContributorType,
      resolve(parent: RewardPrisma, _args, ctx: Context) {
        return ctx.prisma.contributor.findUnique({
          where: {
            id: parent.contributor_id,
          },
        });
      },
    });
  },
});
