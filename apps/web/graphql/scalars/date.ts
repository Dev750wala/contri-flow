import { asNexusMethod } from 'nexus';
import { DateTimeResolver } from 'graphql-scalars';

export const GQLDate = asNexusMethod(DateTimeResolver, 'date');
