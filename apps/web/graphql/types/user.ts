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
                id: nonNull(stringArg()),
            },
            resolve: async (_parent, args, ctx: Context) => {
                return ctx.prisma.user.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            },
        });
    },
});
