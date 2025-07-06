import { Context, createContext } from '@/graphql/context';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from '@/graphql/schema';
import { ApolloServer } from '@apollo/server';
import { NextRequest, NextResponse } from 'next/server';

const server = new ApolloServer<Context>({
  schema,
  logger: {
    debug: (message) => console.debug(message),
    info: (message) => console.info(message),
    warn: (message) => console.warn(message),
    error: (message) => console.error(message),
  },
  cache: 'bounded',
  introspection: true, // needed for playground to work
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => await createContext({ req, res }),
});

export async function GET(request: NextRequest) {
  // Enable Playground in development only
  // if (process.env.NODE_ENV === 'development') {
  return new NextResponse(
    `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>GraphQL Playground</title>
            <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
            <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
            <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
          </head>
          <body>
            <div id="root"></div>
            <script>
              window.addEventListener('load', function () {
                GraphQLPlayground.init(document.getElementById('root'), {
                  endpoint: '/api/graphql'
                });
              });
            </script>
          </body>
        </html>
      `,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
  // }

  // In production, disable UI and just use handler
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
