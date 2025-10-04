import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:3000/api/graphql',
  documents: [
    './app/**/*.{ts,tsx}',
    './graphql/**/*.{ts,tsx,gql,graphql}',
    './components/**/*.{ts,tsx}',
  ],
  generates: {
    './codegen/generated/': {
      preset: 'client',
      plugins: [],
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
