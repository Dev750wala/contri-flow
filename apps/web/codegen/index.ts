import appConfig from "@/config";
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: `${appConfig.NEXTAUTH_URL}/api/graphql`,
  documents: "../**/*.{ts,tsx,graphql,gql}",
  generates: {
    "./generated/": {
      preset: "client",
      plugins: [],
      config: {
        // This ensures React hooks are generated
        withHooks: true,
        // Use the correct import path
        gqlImport: '@apollo/client#gql',
      },
      presetConfig: {
        // This generates everything in a single file
        fragmentMasking: false,
        // Generates the graphql.ts file
        gqlTagName: 'gql',
      }
    },
    "src/graphql/generated/introspection.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
