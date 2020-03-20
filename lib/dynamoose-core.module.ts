/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as dynamoose from 'dynamoose';
import { defer } from 'rxjs';
import { getConnectionToken, handleRetry } from './common/dynamoose.utils';
import {
  MONGOOSE_CONNECTION_NAME,
  MONGOOSE_MODULE_OPTIONS,
} from './dynamoose.constants';
import {
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
  DynamooseOptionsFactory,
} from './interfaces/dynamoose-options.interface';

@Global()
@Module({})
export class DynamooseCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(MONGOOSE_CONNECTION_NAME) private readonly connectionName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(
    uri: string,
    options: DynamooseModuleOptions = {},
  ): DynamicModule {
    const {
      retryAttempts,
      retryDelay,
      connectionName,
      connectionFactory,
      ...dynamooseOptions
    } = options;

    const dynamooseConnectionFactory =
      connectionFactory || (connection => connection);
    const dynamooseConnectionName = getConnectionToken(connectionName);

    const dynamooseConnectionNameProvider = {
      provide: MONGOOSE_CONNECTION_NAME,
      useValue: dynamooseConnectionName,
    };
    const connectionProvider = {
      provide: dynamooseConnectionName,
      useFactory: async (): Promise<any> =>
        await defer(async () =>
          dynamooseConnectionFactory(
            dynamoose.createConnection(uri, dynamooseOptions),
            dynamooseConnectionName,
          ),
        )
          .pipe(handleRetry(retryAttempts, retryDelay))
          .toPromise(),
    };
    return {
      module: DynamooseCoreModule,
      providers: [connectionProvider, dynamooseConnectionNameProvider],
      exports: [connectionProvider],
    };
  }

  static forRootAsync(options: DynamooseModuleAsyncOptions): DynamicModule {
    const dynamooseConnectionName = getConnectionToken(options.connectionName);

    const dynamooseConnectionNameProvider = {
      provide: MONGOOSE_CONNECTION_NAME,
      useValue: dynamooseConnectionName,
    };

    const connectionProvider = {
      provide: dynamooseConnectionName,
      useFactory: async (
        dynamooseModuleOptions: DynamooseModuleOptions,
      ): Promise<any> => {
        const {
          retryAttempts,
          retryDelay,
          connectionName,
          uri,
          connectionFactory,
          ...dynamooseOptions
        } = dynamooseModuleOptions;

        const dynamooseConnectionFactory =
          connectionFactory || (connection => connection);

        return await defer(async () =>
          dynamooseConnectionFactory(
            dynamoose.createConnection(
              dynamooseModuleOptions.uri as string,
              dynamooseOptions,
            ),
            dynamooseConnectionName,
          ),
        )
          .pipe(
            handleRetry(
              dynamooseModuleOptions.retryAttempts,
              dynamooseModuleOptions.retryDelay,
            ),
          )
          .toPromise();
      },
      inject: [MONGOOSE_MODULE_OPTIONS],
    };
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: DynamooseCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        connectionProvider,
        dynamooseConnectionNameProvider,
      ],
      exports: [connectionProvider],
    };
  }

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<any>(this.connectionName);
    connection && (await connection.close());
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
        provide: MONGOOSE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<DynamooseOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<
        DynamooseOptionsFactory
      >,
    ];
    return {
      provide: MONGOOSE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: DynamooseOptionsFactory) =>
        await optionsFactory.createDynamooseOptions(),
      inject,
    };
  }
}
