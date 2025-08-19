import { objectType, extendType, nonNull, stringArg } from 'nexus';
import { Contributor } from 'nexus-prisma';
import { Context } from '../context';
import { RewardType } from './reward';
import { Contributor as ContributorPrisma} from '@prisma/client';
import { UserType } from './user';

export const ContributorType = objectType({
  name: Contributor.$name,
  description: Contributor.$description,
  definition(t) {
    t.nonNull.field(Contributor.id);
    t.nonNull.field(Contributor.github_id);
    t.field(Contributor.email);
    t.field(Contributor.wallet_address);

    t.nonNull.field(Contributor.created_at);
    t.nonNull.field(Contributor.updated_at);

    t.list.field('rewards', {
      type: RewardType,
      resolve(parent: ContributorPrisma, _args, ctx: Context) {
        return ctx.prisma.reward.findMany({
          where: {
            contributor_id: parent.id,
          },
        });
      },
    });

    t.field('user', {
      type: UserType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.user.findUnique({
          where: {
            id: parent.user_id,
          },
        });
      },
    });
  },
});
