import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getSession } from 'next-auth/react';
import config from '@/config';

export async function createContext({ req, res }: { req: any; res: any }) {
  const token = await getToken({ req, secret: config.AUTH_SECRET });
  // console.log('req', req.cookies);
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
