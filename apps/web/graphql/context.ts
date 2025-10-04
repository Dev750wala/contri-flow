import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import config from '@/config';
import { authOptions } from '@/lib/auth';

export async function createContext({ req, res }: { req: any; res: any }) {
  const token = await getToken({ req, secret: config.AUTH_SECRET });
  console.log('Token in context:', token);

  const session = await getServerSession(authOptions);
  console.log('Session in context:', session);

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
