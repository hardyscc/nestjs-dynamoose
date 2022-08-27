import { LoggerService } from '@nestjs/common';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { TableOptionsOptional } from 'dynamoose/dist/Table';

export interface DynamooseModuleOptions {
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  local?: boolean | string;
  ddb?: DynamoDB;
  table?: TableOptionsOptional;
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
