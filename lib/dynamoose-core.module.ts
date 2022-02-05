/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DynamicModule,
  Global,
  Logger,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { aws, logger, model } from 'dynamoose';
import { LoggerProvider } from './dynamoose-logger.provider';
import {
  DYNAMOOSE_INITIALIZATION,
  DYNAMOOSE_MODULE_OPTIONS,
} from './dynamoose.constants';
import { DynamooseModule } from './dynamoose.module';
import {
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
  DynamooseOptionsFactory,
} from './interfaces/dynamoose-options.interface';

function initialization(options: DynamooseModuleOptions) {
  if (options.aws) {
    aws.sdk.config.update(options.aws);
  }
  if (options.local) {
    if (typeof options.local === 'boolean') {
      aws.ddb.local();
    } else {
      aws.ddb.local(options.local);
    }
  }
  if (options.ddb) {
    aws.ddb.set(options.ddb);
  }
  if (options.model) {
    model.defaults.set(options.model);
  }
  if (options.logger) {
    logger.providers.add(
      new LoggerProvider(
        typeof options.logger === 'boolean'
          ? new Logger(DynamooseModule.name)
          : options.logger,
      ),
    );
  }
}

@Global()
@Module({})
export class DynamooseCoreModule {
  static forRoot(options: DynamooseModuleOptions = {}): DynamicModule {
    const initialProvider = {
      provide: DYNAMOOSE_INITIALIZATION,
      useFactory: () => initialization(options),
    };
    return {
      module: DynamooseCoreModule,
      providers: [initialProvider],
      exports: [initialProvider],
    };
  }

  static forRootAsync(options: DynamooseModuleAsyncOptions): DynamicModule {
    const initialProvider = {
      provide: DYNAMOOSE_INITIALIZATION,
      useFactory: (dynamoooseModuleOptions: DynamooseModuleOptions) =>
        initialization(dynamoooseModuleOptions),
      inject: [DYNAMOOSE_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: DynamooseCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, initialProvider],
      exports: [initialProvider],
    };
  }

  private static createAsyncProviders(
    options: DynamooseModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<DynamooseOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: DynamooseModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: DYNAMOOSE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<DynamooseOptionsFactory>,
    ];

    return {
      provide: DYNAMOOSE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: DynamooseOptionsFactory) =>
        await optionsFactory.createDynamooseOptions(),
      inject,
    };
  }
}
