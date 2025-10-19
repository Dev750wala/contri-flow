import { objectType, extendType, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import config from '@/config';
import { Repository } from 'nexus-prisma';
import { OrganizationType } from './organization';
import { RewardType } from './reward';
import { Repository as RepositoryPrisma } from '@prisma/client';
import { RepositoryMaintainerType } from './repository-maintainer';

export const RepositoryType = objectType({
  name: Repository.$name,
  description: Repository.$description,
  definition(t) {
    t.nonNull.field(Repository.id);
    t.nonNull.field(Repository.name);
    t.nonNull.field(Repository.github_repo_id);

    t.nonNull.field(Repository.is_removed);
    t.field(Repository.removed_at);

    t.nonNull.field(Repository.created_at);
    t.nonNull.field(Repository.updated_at);

    t.nonNull.list.nonNull.field(Repository.maintainers.name, {
      type: RepositoryMaintainerType,
      resolve(parent: RepositoryPrisma, _args, ctx: Context) {
        return ctx.prisma.repositoryMaintainer.findMany({
          where: {
            repository_id: parent.id,
          }
        })
      }
    })

    t.nonNull.field(Repository.enabled_rewards)
    
    t.field('organization', {
      type: OrganizationType,
      resolve(parent: RepositoryPrisma, _args, ctx: Context) {
        return ctx.prisma.organization.findUnique({
          where: {
            id: parent.organization_id,
          },
        });
      },
    });

    t.list.field('rewards', {
      type: RewardType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.reward.findMany({
          where: {
            repository_id: parent.id,
          },
        });
      },
    });
  },
});
