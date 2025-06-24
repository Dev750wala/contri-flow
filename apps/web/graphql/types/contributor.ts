import { objectType, extendType, nonNull } from "nexus";


export const Contributor = objectType({
    name: "Contributor",
    description: "A contributor to the project, identified by their GitHub ID.",
    definition(t) {
        t.nonNull.string("id");
        t.nonNull.string("githubId");
        t.string("walletAddress");
        t.nonNull.string("createdAt");
        t.nonNull.string("updatedAt");
        t.list.field("rewards", {
            type: "Reward",
            resolve: async (parent, _args, ctx) => {
                return ctx.prisma.reward.findMany({
                    where: {
                        contributorGithubId: parent.githubId,
                    },
                });
            },
        });
    },
})

export const ContributorQuery = extendType({
    type: "Query",
    definition(t) {
        t.field("contributor", {
            type: "Contributor",
            args: {
                githubId: nonNull("String"),
            },
            resolve: async (_parent, args, ctx) => {
                return ctx.prisma.contributor.findUnique({
                    where: {
                        githubId: args.githubId,
                    },
                });
            },
        });
    },
});