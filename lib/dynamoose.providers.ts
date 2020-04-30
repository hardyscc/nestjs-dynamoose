import { flatten } from '@nestjs/common';
import * as dynamoose from 'dynamoose';
import { getModelToken } from './common/dynamoose.utils';
import { DYNAMOOSE_INITIALIZATION } from './dynamoose.constants';
import { ModelDefinition } from './interfaces';
import { AsyncModelFactory } from './interfaces/async-model-factory.interface';

export function createDynamooseProviders(models: ModelDefinition[] = []) {
  const providers = (models || []).map((model) => ({
    provide: getModelToken(model.name),
    useFactory: () =>
      dynamoose.model(model.name, model.schema, model.options) as any,
    inject: [DYNAMOOSE_INITIALIZATION],
  }));
  return providers;
}

export function createDynamooseAsyncProviders(
  modelFactories: AsyncModelFactory[] = [],
) {
  const providers = (modelFactories || []).map((model) => [
    {
      provide: getModelToken(model.name),
      useFactory: async (...args: unknown[]) => {
        const schema = await model.useFactory(...args);
        return dynamoose.model(model.name, schema, model.options) as any;
      },
      inject: [DYNAMOOSE_INITIALIZATION, ...(model.inject || [])],
    },
  ]);
  return flatten(providers);
}
