import { asNexusMethod } from 'nexus';
import { JSONResolver } from 'graphql-scalars';

export const GQLJson = asNexusMethod(JSONResolver, 'json');
