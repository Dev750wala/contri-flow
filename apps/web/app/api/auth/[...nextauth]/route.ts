import NextAuth, {
  Session,
  User,
  Account,
  Profile,
  NextAuthOptions,
} from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import GithubProvider from 'next-auth/providers/github';
import prisma from '@/lib/prisma';
import { type GithubProfile } from 'next-auth/providers/github';

declare module 'next-auth' {
  interface Session {
    user: {
      userId?: string;
      githubId?: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
    }) {
      const githubProfile = profile as GithubProfile | undefined;
      const githubId = githubProfile?.id;
      const email = profile?.email;

      // console.log("--------------------------");
      // console.log(githubId);
      // console.log(typeof githubId);
      // console.log("--------------------------");

      let dbUser = await prisma.user.findUnique({
        where: { githubId: githubId?.toString() },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            name: profile?.name || (profile as any)?.login || 'NoName',
            githubId: githubId?.toString()!,
            email: email!,
          },
        });
      }

      return true;
    },

    async jwt({
      token,
      user,
      account,
      profile,
    }: {
      token: any;
      user?: User;
      account?: any;
      profile?: any;
    }) {
      if (account && profile) {
        const dbUser = await prisma.user.findUnique({
          where: { githubId: account.providerAccountId },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.githubId = dbUser.githubId;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: any }) {
      // console.log("session: ", session);
      // console.log("token: ", token);

      if (!session.user) session.user = {};
      session.user.githubId = token.githubId;
      session.user.userId = token.userId as string;
      session.user.name = token.name;
      session.user.email = token.email;

      console.log('HEre is the secret');

      console.log(process.env.AUTH_SECRET);

      console.log(session.user);

      return session;
    },
  },
  pages: {
    error: '/error',
    newUser: '/',
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-up',
  },
  logger: {
    // will look into this later.
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
