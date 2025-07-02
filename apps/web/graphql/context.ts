import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getSession } from 'next-auth/react';

export async function createContext({ req, res }: { req: any; res: any }) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  console.log('Token in context:', token);

  const session = await getSession({ req });
  return {
    prisma,
    session,
    req,
    res,
    token,
  };
}

export type Context =
  ReturnType<typeof createContext> extends Promise<infer T> ? T : never;
