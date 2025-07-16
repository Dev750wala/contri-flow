import { ApolloClient, InMemoryCache } from '@apollo/client';
import config from '@/config';

const client = new ApolloClient({
  uri: `${config.NEXTAUTH_URL}/api/graphql`,
  cache: new InMemoryCache(),
  credentials: 'include',
});

export default client;
