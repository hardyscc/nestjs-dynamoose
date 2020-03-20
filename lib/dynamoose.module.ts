import { DynamicModule, flatten, Module } from '@nestjs/common';
import { DynamooseCoreModule } from './dynamoose-core.module';
import {
  createDynamooseAsyncProviders,
  createDynamooseProviders,
} from './dynamoose.providers';
import { AsyncModelFactory, ModelDefinition } from './interfaces';
import {
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
} from './interfaces/dynamoose-options.interface';

@Module({})
export class DynamooseModule {
  static forRoot(
    uri: string,
    options: DynamooseModuleOptions = {},
  ): DynamicModule {
    return {
      module: DynamooseModule,
      imports: [DynamooseCoreModule.forRoot(uri, options)],
    };
  }

  static forRootAsync(options: DynamooseModuleAsyncOptions): DynamicModule {
    return {
      module: DynamooseModule,
      imports: [DynamooseCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(
    models: ModelDefinition[] = [],
    connectionName?: string,
  ): DynamicModule {
    const providers = createDynamooseProviders(connectionName, models);
    return {
      module: DynamooseModule,
      providers: providers,
      exports: providers,
    };
  }

  static forFeatureAsync(
    factories: AsyncModelFactory[] = [],
    connectionName?: string,
  ): DynamicModule {
    const providers = createDynamooseAsyncProviders(connectionName, factories);
    const imports = factories.map(factory => factory.imports || []);
    const uniqImports = new Set(flatten(imports));

    return {
      module: DynamooseModule,
      imports: [...uniqImports],
      providers: providers,
      exports: providers,
    };
  }
}
