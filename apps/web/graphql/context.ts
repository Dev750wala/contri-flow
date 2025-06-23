import prisma from "@/lib/prisma";
import { getSession } from "next-auth/react";

export async function createContext({ req, res }: { req: any; res: any }) {
    const session = await getSession({req});
    return {
        prisma,
        session,
        req,
        res
    };
}


export type Context = ReturnType<typeof createContext> extends Promise<infer T>? T : never;
