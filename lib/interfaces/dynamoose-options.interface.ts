import { ModelOptions } from './model-options.interface';

export interface DynamooseModuleOptions extends Record<string, any> {
  model: ModelOptions;
}
