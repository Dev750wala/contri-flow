import { ApolloClient, InMemoryCache } from '@apollo/client';
import config from '@/config';

const client = new ApolloClient({
  uri: `${config.NEXTAUTH_URL}/api/graphql`,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  },
  credentials: 'include',
});

export default client;
