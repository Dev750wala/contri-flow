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

