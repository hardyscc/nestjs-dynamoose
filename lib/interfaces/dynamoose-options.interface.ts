import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { ModelOptions } from './model-options.interface';

export interface DynamooseModuleOptions {
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  model?: ModelOptions;
}

export interface DynamooseOptionsFactory {
  createDynamooseOptions():
    | Promise<DynamooseModuleOptions>
    | DynamooseModuleOptions;
}

export interface DynamooseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<DynamooseOptionsFactory>;
  useClass?: Type<DynamooseOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<DynamooseModuleOptions> | DynamooseModuleOptions;
  inject?: any[];
}
