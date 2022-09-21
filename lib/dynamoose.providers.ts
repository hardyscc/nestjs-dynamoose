import { FactoryProvider, flatten } from '@nestjs/common';
import * as dynamoose from 'dynamoose';
import { getModelToken, getTableToken } from './common/dynamoose.utils';
import { DYNAMOOSE_INITIALIZATION } from './dynamoose.constants';
import { ModelDefinition, TableDefinition } from './interfaces';
import { AsyncModelFactory } from './interfaces/async-model-factory.interface';

export function createDynamooseProviders(models: ModelDefinition[] = []) {
  return (models || []).map((model) => ({
    provide: getModelToken(model.name),
    useFactory: () => {
      const modelInstance = dynamoose.model(
        model.name,
        model.schema,
        model.options,
      );
      if (model.serializers) {
        Object.entries(model.serializers).forEach(([key, value]) => {
          modelInstance.serializer.add(key, value);
        });
      }
      return modelInstance;
    },
    inject: [DYNAMOOSE_INITIALIZATION],
  }));
}

export function createDynamooseTableProviders(table: TableDefinition) {
  const modelProviders = createDynamooseProviders(table.models);

  return [
    {
      provide: getTableToken(table.name),
      useFactory: (...models) => (
        new dynamoose.Table(table.name, models, table.options)
      ),
      inject: [...table.models.map((model) => getModelToken(model.name))],
    },
    ...modelProviders,
  ];
}

export function createDynamooseAsyncProviders(
  modelFactories: AsyncModelFactory[] = [],
): FactoryProvider[] {
  const providers = (modelFactories || []).map((model) => [
    {
      provide: getModelToken(model.name),
      useFactory: async (...args: unknown[]) => {
        const schema = await model.useFactory(...args);
        const modelInstance = dynamoose.model(
          model.name,
          schema,
          model.options,
        );
        if (model.serializers) {
          Object.entries(model.serializers).forEach(([key, value]) => {
            modelInstance.serializer.add(key, value);
          });
        }
        return modelInstance;
      },
      inject: [DYNAMOOSE_INITIALIZATION, ...(model.inject || [])],
    },
  ]);
  return flatten(providers);
}
