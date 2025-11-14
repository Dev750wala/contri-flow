// Load environment variables from .env.local first
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import path from 'path';
import { makeSchema } from 'nexus';
import * as types from '../types';
import * as resolvers from '../resolvers';
import { GQLDate, GQLJson } from '../scalars';

export const schema = makeSchema({
  types: [
    GQLDate,
    GQLJson,
    ...Object.values(types),
    ...Object.values(resolvers),
  ],
  outputs: {
    typegen: path.join(process.cwd(), 'generated', 'nexus-typegen.ts'),
    schema: path.join(process.cwd(), 'generated', 'schema.graphql'),
  },
  contextType: {
    module: require.resolve('../context'),
    export: 'Context',
  },
});

console.log('✅ Schema generation complete!');
console.log('📄 Generated files:');
console.log('   - generated/nexus-typegen.ts');
console.log('   - generated/schema.graphql');
