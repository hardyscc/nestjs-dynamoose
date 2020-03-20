import { DynamicModule, Module } from '@nestjs/common';
import { DynamooseCoreModule } from './dynamoose-core.module';
import { createDynamooseProviders } from './dynamoose.providers';
import { ModelDefinition } from './interfaces';
import { DynamooseModuleOptions } from './interfaces/dynamoose-options.interface';

@Module({})
export class DynamooseModule {
  static forRoot(
    options: DynamooseModuleOptions = { model: {} },
  ): DynamicModule {
    return {
      module: DynamooseModule,
      imports: [DynamooseCoreModule.forRoot(options)],
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
}
