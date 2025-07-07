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
import { profile } from 'console';

declare module 'next-auth' {
  interface Session {
    user: {
      userId?: string;
      github_id?: string;
      name?: string | null;
      email?: string | null;
    };
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    github_id?: string;
    name?: string | null;
    email?: string | null;
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: { params: { scope: 'read:user user:email' } },
      profile: async (profile, tokens) => {
        const res = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        const emails = await res.json();

        const primaryEmail = emails.find(
          (email: any) => email.primary && email.verified
        );

        return {
          id: profile.id,
          name: profile.name || profile.login,
          email: primaryEmail?.email || null,
          image: profile.avatar_url,
        };
      },
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

      profile &&
        (await prisma.user.upsert({
          where: { github_id: githubId?.toString() },
          create: {
            name: profile?.name || (profile as any)?.login || 'NoName',
            github_id: githubId?.toString()!,
            email: email!,
          },
          update: {
            email: email!,
          },
        }));

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
          where: { github_id: account.providerAccountId },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.github_id = dbUser.github_id;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: any }) {
      if (!session.user) session.user = {};
      session.user.github_id = token.github_id;
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
