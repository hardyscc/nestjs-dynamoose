import { flatten } from '@nestjs/common';
import { model } from 'dynamoose';
import { getModelToken } from './common/dynamoose.utils';
import { DYNAMOOSE_INITIALIZATION } from './dynamoose.constants';
import { ModelDefinition } from './interfaces';
import { AsyncModelFactory } from './interfaces/async-model-factory.interface';

export function createDynamooseProviders(models: ModelDefinition[] = []) {
  const providers = (models || []).map((m) => ({
    provide: getModelToken(m.name),
    useFactory: () => model(m.name, m.schema, m.options) as any,
    inject: [DYNAMOOSE_INITIALIZATION],
  }));
  return providers;
}

export function createDynamooseAsyncProviders(
  modelFactories: AsyncModelFactory[] = [],
) {
  const providers = (modelFactories || []).map((m) => [
    {
      provide: getModelToken(m.name),
      useFactory: async (...args: unknown[]) => {
        const schema = await m.useFactory(...args);
        return model(m.name, schema, m.options) as any;
      },
      inject: [DYNAMOOSE_INITIALIZATION, ...(m.inject || [])],
    },
  ]);
  return flatten(providers);
}
