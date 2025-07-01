import { ApolloClient, InMemoryCache } from "@apollo/client"

const client = new ApolloClient({
    uri: `${process.env.NEXTAUTH_URL}/api/graphql`,
    cache: new InMemoryCache(),
    credentials: 'include',
})

export default client