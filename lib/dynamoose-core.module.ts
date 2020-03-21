/* eslint-disable @typescript-eslint/no-unused-vars */
import { DynamicModule, Global, Module } from '@nestjs/common';
import * as dynamoose from 'dynamoose';
import { DynamooseModuleOptions } from './interfaces/dynamoose-options.interface';

@Global()
@Module({})
export class DynamooseCoreModule {
  static forRoot(options: DynamooseModuleOptions = {}): DynamicModule {
    if (options.aws) {
      dynamoose.aws.sdk.config.update(options.aws);
    }
    if (options.model) {
      dynamoose.Model.defaults = options.model;
    }

    return {
      module: DynamooseCoreModule,
    };
  }
}
