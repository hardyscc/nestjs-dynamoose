import { flatten } from '@nestjs/common';
import { Connection, Schema } from 'dynamoose';
import { getConnectionToken, getModelToken } from './common/dynamoose.utils';
import { AsyncModelFactory } from './interfaces';

export function createDynamooseProviders(
  connectionName?: string,
  models: { name: string; schema: Schema; collection?: string }[] = [],
) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.name),
    useFactory: (connection: Connection) =>
      connection.model(model.name, model.schema, model.collection),
    inject: [getConnectionToken(connectionName)],
  }));
  return providers;
}

export function createDynamooseAsyncProviders(
  connectionName?: string,
  modelFactories: AsyncModelFactory[] = [],
) {
  const providers = (modelFactories || []).map(model => [
    {
      provide: getModelToken(model.name),
      useFactory: async (connection: Connection, ...args: unknown[]) => {
        const schema = await model.useFactory(...args);
        return connection.model(model.name, schema, model.collection);
      },
      inject: [getConnectionToken(connectionName), ...(model.inject || [])],
    },
  ]);
  return flatten(providers);
}
