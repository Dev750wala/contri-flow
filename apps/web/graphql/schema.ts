import path from 'path';
import { makeSchema } from 'nexus';
import * as types from './types';
import { GQLDate } from './scalars';

export const schema = makeSchema({
  types: [GQLDate, ...Object.values(types)],
  outputs: {
    schema: path.resolve(__dirname, 'schema.graphql'),
    typegen: path.resolve(__dirname, 'nexus-typegen.ts'),
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
});
