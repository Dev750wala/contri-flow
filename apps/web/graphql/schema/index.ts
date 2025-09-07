import path from 'path';
import { makeSchema } from 'nexus';
import * as types from '../types';
import * as resolvers from '../resolvers';
import { GQLDate } from '../scalars';

export const schema = makeSchema({
  types: [GQLDate, ...Object.values(types), ...Object.values(resolvers)],
  outputs: {
    typegen: path.join(process.cwd(), 'generated', 'nexus-typegen.ts'),
    schema: path.join(process.cwd(), 'generated', 'schema.graphql'),
  },
  contextType: {
    module: require.resolve('../context'),
    export: 'Context',
  },
});
