import { Model, Schema } from 'dynamoose';
import { getModelToken } from './common/dynamoose.utils';

export function createDynamooseProviders(
  models: { name: string; schema: Schema }[] = [],
) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.name),
    useFactory: () => new Model(model.name, model.schema),
  }));
  return providers;
}
