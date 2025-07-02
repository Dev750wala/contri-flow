import path from 'path';
import { makeSchema } from 'nexus';
import * as types from './types';

export const schema = makeSchema({
  types,
  outputs: {
    schema: path.resolve(__dirname, 'schema.graphql'),
    typegen: path.resolve(__dirname, 'nexus-typegen.ts'),
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
});
