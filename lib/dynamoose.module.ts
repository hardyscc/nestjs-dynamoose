import { DynamicModule, flatten, Module } from '@nestjs/common';
import { DynamooseCoreModule } from './dynamoose-core.module';
import {
  createDynamooseAsyncProviders,
  createDynamooseProviders,
} from './dynamoose.providers';
import { ModelDefinition } from './interfaces';
import { AsyncModelFactory } from './interfaces/async-model-factory.interface';
import {
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
} from './interfaces/dynamoose-options.interface';

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
