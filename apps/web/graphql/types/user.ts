import { objectType } from 'nexus';
import { Context } from '../context';
import { User } from 'nexus-prisma';
import { RepositoryMaintainerType } from './repository-maintainer';
import { ContributorType } from './contributor';

export const UserType = objectType({
  name: 'User',
  description: User.$description,
  definition(t) {
    t.nonNull.field(User.id);
    t.nonNull.field(User.name);
    t.field(User.email);
    t.nonNull.field(User.github_id);
    t.field(User.wallet_address);

    t.nonNull.field(User.created_at);
    t.nonNull.field(User.updated_at);

    t.list.field('maintenances', {
      type: RepositoryMaintainerType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.repositoryMaintainer.findMany({
          where: {
            user_id: parent.id,
          },
        });
      },
    });

    t.list.field('contributor', {
      type: ContributorType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.contributor.findMany({
          where: {
            user_id: parent.id,
          },
        });
      },
    });
  },
});