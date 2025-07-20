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
import config from '@/config';

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
      clientId: config.AUTH_GITHUB_ID,
      clientSecret: config.AUTH_GITHUB_SECRET,
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

  secret: config.AUTH_SECRET,

  callbacks: {
    async signIn({
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

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          userId: token.userId,
          github_id: token.github_id,
          name: token.name || session.user.name,
          email: token.email || session.user.email,
        },
      };
    }
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
