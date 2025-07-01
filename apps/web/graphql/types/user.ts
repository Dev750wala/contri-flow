import { objectType, extendType, nonNull, stringArg } from "nexus";
import { Context } from "../context";


export const User = objectType({
    name: "User",
    definition(t) {
        t.typeName
        t.nonNull.string("name");
        t.nonNull.string("email");
        t.nonNull.string("githubId");
        t.string("walletAddress");
        t.list.field("repositories", {
            type: "Repository",
            resolve: async (parent, _args, ctx: Context) => {
                return ctx.prisma.repository.findMany({
                    where: {
                        userId: parent.id,
                    },
                });
            }
        })
        t.string("signMessageHash");
        t.string("installationId");
        t.nonNull.string("createdAt");
        t.nonNull.string("updatedAt");
    },
})


export const UserQuery = extendType({
    type: "Query",
    definition(t) {
        t.field("user", {
            type: "User",
            args: {
                githubId: nonNull(stringArg()),
            },
            resolve: async (_parent, args: { githubId: string }, ctx: Context) => {
                return ctx.prisma.user.findUnique({
                    where: {
                        githubId: args.githubId,
                    },
                });
            },
        });
        t.field("me", {
            type: "User",
            resolve: async (_parent, _args, ctx: Context) => {
                
                if (!ctx.token) {
                    throw new Error("Not authenticated");
                }
                return ctx.prisma.user.findUnique({
                    where: {
                        id: ctx.token!.userId as string,
                    },
                });
            },
        });
        t.list.field("allUsers", {
            type: "User",
            args: {
                token: nonNull(stringArg())
            },
            resolve: async (_parent, args, ctx: Context) => {
                if (!args.token || args.token !== process.env.DEVELOPMENT_TOKEN ) {
                    throw new Error("Invalid or missing token");
                }
                return ctx.prisma.user.findMany();
            },
        })
    },
});
