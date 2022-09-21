import { DynamicModule, flatten, Module } from '@nestjs/common';
import { DynamooseCoreModule } from './dynamoose-core.module';
import {
  createDynamooseAsyncProviders, createDynamooseProviders,
  createDynamooseTableProviders,
} from './dynamoose.providers';
import { AsyncModelFactory } from './interfaces/async-model-factory.interface';
import {
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
  ModelDefinition,
  TableDefinition,
} from './interfaces';

@Module({})
export class DynamooseModule {
  static forRoot(options: DynamooseModuleOptions = {}): DynamicModule {
    return {
      module: DynamooseModule,
      imports: [DynamooseCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: DynamooseModuleAsyncOptions): DynamicModule {
    return {
      module: DynamooseModule,
      imports: [DynamooseCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(models: ModelDefinition[] = []): DynamicModule {
    const providers = createDynamooseProviders(models);
    return {
      module: DynamooseModule,
      providers: providers,
      exports: providers,
    };
  }

  static forFeatureAsync(factories: AsyncModelFactory[] = []): DynamicModule {
    const providers = createDynamooseAsyncProviders(factories);
    const imports = factories.map((factory) => factory.imports || []);
    const uniqImports = new Set(flatten(imports));
    return {
      module: DynamooseModule,
      imports: [...uniqImports],
      providers: providers,
      exports: providers,
    };
  }

  static forTable(table: TableDefinition): DynamicModule {
    const providers = createDynamooseTableProviders(table);
    return {
      module: DynamooseModule,
      providers: providers,
      exports: providers,
    };
  }
}
