import { flatten } from '@nestjs/common';
import { Model } from 'dynamoose';
import { getModelToken } from './common/dynamoose.utils';
import { ModelDefinition } from './interfaces';
import { AsyncModelFactory } from './interfaces/async-model-factory.interface';

export function createDynamooseProviders(models: ModelDefinition[] = []) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.name),
    useFactory: () => new Model(model.name, model.schema, model.options),
  }));
  return providers;
}

export function createDynamooseAsyncProviders(
  modelFactories: AsyncModelFactory[] = [],
) {
  const providers = (modelFactories || []).map(model => [
    {
      provide: getModelToken(model.name),
      useFactory: async (...args: unknown[]) => {
        const schema = await model.useFactory(...args);
        return new Model(model.name, schema, model.options);
      },
      inject: [...(model.inject || [])],
    },
  ]);
  return flatten(providers);
}
