import { ModelOptions } from './model-options.interface';

export type ModelDefinition = {
  name: string;
  schema: any;
  options?: ModelOptions;
};
