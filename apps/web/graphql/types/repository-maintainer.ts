import { objectType, enumType } from 'nexus';
import { RepositoryMaintainer, Reward } from 'nexus-prisma';
import { Context } from '../context';
import { UserType } from './user';
import { RepositoryType } from './repository';
import { RepositoryRole as Roles, RepositoryMaintainer as RepositoryMaintainerPrisma } from '@prisma/client';
import { RewardType } from './reward';

export const RepositoryRole = enumType({
  name: 'RepositoryRole',
  members: Roles,
});

export const RepositoryMaintainerType = objectType({
  name: RepositoryMaintainer.$name,
  description: RepositoryMaintainer.$description,
  definition(t) {
    t.nonNull.field(RepositoryMaintainer.id);
    t.nonNull.field(RepositoryMaintainer.role);
    t.nonNull.field(RepositoryMaintainer.created_at);
    t.nonNull.field(RepositoryMaintainer.github_id);

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

    t.nonNull.field(Reward.$name, {
      type: RewardType,
      resolve(parent: RepositoryMaintainerPrisma, _args, ctx: Context) {
        return ctx.prisma.reward.findMany({
          where: {
            issuar_id: parent.id
          },
        });
      },
    });

    t.nonNull.field('repository', {
      type: RepositoryType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.repository.findUnique({
          where: {
            id: parent.repository_id,
          },
        });
      },
    });
  },
});
