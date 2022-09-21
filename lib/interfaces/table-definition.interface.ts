import { TableOptionsOptional } from 'dynamoose/dist/Table';
import { ModelDefinition } from './model-definition.interface';

export type TableDefinition = {
  name: string
  models: ModelDefinition[],
  options?: TableOptionsOptional,
};
