import { objectType, extendType, nonNull, stringArg } from "nexus";
import { Context } from "../context";

export const Reward = objectType({
    name: "Reward",
    definition(t) {
        t.nonNull.string("id");
        t.nonNull.string("owenrGithubId");
        t.nonNull.string("contributorGithubId");
        t.nonNull.string("repoGithubId");
        t.nonNull.int("prNumber");
        t.nonNull.string("secret");
        t.nonNull.float("amountUsd");
        t.nonNull.float("amountEth");
        t.nonNull.string("createdAt");
        t.nonNull.boolean("claimed");
        t.nonNull.string("claimedAt");
        t.nonNull.string("updatedAt");
        t.field("repository", {
            type: "Repository",
            resolve: async (parent, _args, ctx: Context) => {
                return ctx.prisma.repository.findUnique({
                    where: {
                        id: parent.repositoryId,
                    },
                });
            },
        });
        t.field("contributor", {
            type: "Contributor",
            resolve: async (parent, args, ctx: Context) => {
                return ctx.prisma.contributor.findUnique({
                    where: {
                        githubId: parent.contributorGithubId,
                    },
                });
            }
        })
    },
});


export const RewardQuery = extendType({
    type: "Query",
    definition(t) {
        t.field("reward", {
            type: "Reward",
            args: {
                id: nonNull(stringArg()),
            },
            resolve: async (_parent, args, ctx: Context) => {
                return ctx.prisma.reward.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            },
        });
    },
});