import { objectType, extendType, nonNull, stringArg } from "nexus";
import { Context } from "../context";

export const Repository = objectType({
    name: "Repository",
    definition(t) {
        t.nonNull.string("id");
        t.nonNull.string("name");
        t.nonNull.string("githubRepoId");
        t.nonNull.string("createdAt");
        t.nonNull.string("updatedAt");
        t.field("user", {
            type: "User",
            resolve: async (parent, _args, ctx: Context) => {
                return ctx.prisma.user.findUnique({
                    where: {
                        id: parent.userId,
                    },
                });
            },
        });
        t.list.field("rewards", {
            type: "Reward",
            resolve: async (parent, args, ctx: Context) => {
                return ctx.prisma.reward.findMany({
                    where: {
                        repositoryId: parent.id,
                    },
                })
            }
        })
    },
})


export const RepositoryQuery = extendType({
    type: "Query",
    definition(t) {
        t.field("repository", {
            type: "Repository",
            args: {
                id: nonNull(stringArg()),
            },
            resolve: async (_parent, args, ctx: Context) => {
                return ctx.prisma.repository.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            },
        });
    },
});