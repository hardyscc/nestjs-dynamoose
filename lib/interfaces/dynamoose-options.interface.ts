import { ModelOptions } from './model-options.interface';

export interface DynamooseModuleOptions {
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  model?: ModelOptions;
}
