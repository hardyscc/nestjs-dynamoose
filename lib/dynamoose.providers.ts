import { flatten } from '@nestjs/common';
import * as dynamoose from 'dynamoose';
import { ModelTableOptions } from 'dynamoose/dist/Model'
import { getModelToken } from './common/dynamoose.utils';
import { DYNAMOOSE_INITIALIZATION } from './dynamoose.constants';
import { ModelDefinition } from './interfaces';
import { AsyncModelFactory } from './interfaces/async-model-factory.interface';

export function createDynamooseProviders(models: ModelDefinition[] = []) {
  const providers = (models || []).map((model) => ({
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
  return providers;
}

export function createDynamooseAsyncProviders(
  modelFactories: AsyncModelFactory[] = [],
) {
  const providers = (modelFactories || []).map((model) => [
    {
      provide: getModelToken(model.name),
      useFactory: async (...args: unknown[]) => {
        const object = await model.useFactory(...args);

        let modelDefinition: Omit<ModelDefinition, 'name'> | undefined;
        let schema: ModelDefinition['schema'] | undefined;
        if (object.hasOwnProperty('schema')) {
          modelDefinition = object as Omit<ModelDefinition, 'name'>;
          schema = modelDefinition.schema;
        } else {
          schema = object as ModelDefinition['schema'];
        }
        const tableName =
          modelDefinition?.tableName || model.tableName || model.name;
        const options: ModelTableOptions = modelDefinition?.options || model.options || {};
        const serializers = modelDefinition?.serializers || model.serializers;

        options.tableName = tableName

        const modelInstance = dynamoose.model(model.name, schema, options);
        if (serializers) {
          Object.entries(serializers).forEach(([key, value]) => {
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
