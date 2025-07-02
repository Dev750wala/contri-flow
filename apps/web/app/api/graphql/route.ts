import { Context, createContext } from '@/graphql/context';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from '@/graphql/schema';
import { ApolloServer } from '@apollo/server';
import { NextRequest } from 'next/server';

const server = new ApolloServer<Context>({
  schema,
  logger: {
    debug: (message) => console.debug(message),
    info: (message) => console.info(message),
    warn: (message) => console.warn(message),
    error: (message) => console.error(message),
  },
  cache: 'bounded',
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => await createContext({ req, res }),
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
