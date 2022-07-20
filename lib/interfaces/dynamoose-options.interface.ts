import { LoggerService } from '@nestjs/common';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { DynamoDB } from 'aws-sdk';
import { ModelOptionsOptional } from 'dynamoose/dist/Model';

export interface DynamooseModuleOptions {
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    region?: string;
  };
  local?: boolean | string;
  ddb?: DynamoDB;
  model?: ModelOptionsOptional;
  logger?: boolean | LoggerService;
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
