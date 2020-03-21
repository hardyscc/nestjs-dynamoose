import { Model } from 'dynamoose';
import { getModelToken } from './common/dynamoose.utils';
import { ModelDefinition } from './interfaces';

export function createDynamooseProviders(models: ModelDefinition[] = []) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.name),
    useFactory: () => new Model(model.name, model.schema, model.options),
  }));
  return providers;
}
