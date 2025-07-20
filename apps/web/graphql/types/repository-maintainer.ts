import { extendType, objectType, nonNull, stringArg, list, enumType } from "nexus"
import { RepositoryMaintainer } from "nexus-prisma"
import { Context } from "../context"
import { UserType } from "./user"
import { RepositoryType } from "./repository"

export const RepositoryRole = enumType({
  name: "RepositoryRole",
  members: ["MAINTAINER", "CONTRIBUTOR", "VIEWER"],
})

export const RepositoryMaintainerType = objectType({
  name: RepositoryMaintainer.$name,
  description: RepositoryMaintainer.$description,
  definition(t) {
    t.nonNull.field(RepositoryMaintainer.id)
    t.nonNull.field(RepositoryMaintainer.role)
    t.nonNull.field(RepositoryMaintainer.created_at)

    t.nonNull.field('user', {
      type: UserType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.user.findUnique({
          where: {
            id: parent.user_id,
          },
        });
      },
    })
    t.nonNull.field('repository', {
      type: RepositoryType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.repository.findUnique({
          where: {
            id: parent.repository_id,
          },
        });
      },
    })
  },
})

export const RepositoryMaintainerQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("repositoryMaintainers", {
      type: nonNull(list(nonNull('RepositoryMaintainer'))),
      args: {
        repositoryId: nonNull(stringArg()),
      },
      resolve: async (_root, args, ctx: Context) => {
        const { repositoryId } = args
        return ctx.prisma.repositoryMaintainer.findMany({
          where: { repository_id: repositoryId },
        })
      },
    })
  },
})


export const RepositoryMaintainerMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("addRepositoryMaintainer", {
      type: nonNull(RepositoryMaintainerType),
      args: {
        repositoryId: nonNull(stringArg()),
        userId: nonNull(stringArg()),
        role: nonNull('RepositoryRole'),
      },
      resolve: async (_root, args, ctx: Context) => {
        const { repositoryId, userId, role } = args
        return ctx.prisma.repositoryMaintainer.create({
          data: {
            repository_id: repositoryId,
            user_id: userId,
            role,
          },
        })
      },
    })

    t.field("removeRepositoryMaintainer", {
      type: 'Boolean',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_root, args, ctx: Context) => {
        const { id } = args
        await ctx.prisma.repositoryMaintainer.delete({
          where: { id },
        })
        return true
      },
    })
  },
})