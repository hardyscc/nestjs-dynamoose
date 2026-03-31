<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nestjs-dynamoose"><img src="https://img.shields.io/npm/v/nestjs-dynamoose" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/nestjs-dynamoose"><img src="https://img.shields.io/npm/dm/nestjs-dynamoose.svg" alt="NPM Downloads" /></a>
  <a href="https://github.com/hardyscc/nestjs-dynamoose/actions"><img src="https://github.com/hardyscc/nestjs-dynamoose/workflows/Node.js%20CI/badge.svg" alt="CI Status" /></a>
  <a href="https://github.com/hardyscc/nestjs-dynamoose/blob/master/LICENSE"><img src="https://img.shields.io/github/license/hardyscc/nestjs-dynamoose" alt="License" /></a>
</p>

# NestJS-Dynamoose

A [Dynamoose](https://dynamoosejs.com/) module for [NestJS](https://github.com/nestjs/nest), providing seamless integration of DynamoDB with NestJS's dependency injection system.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Synchronous](#synchronous-configuration)
  - [Asynchronous](#asynchronous-configuration)
- [Model Registration](#model-registration)
  - [Synchronous](#synchronous-registration)
  - [Asynchronous](#asynchronous-registration)
- [Usage](#usage)
- [Advanced Features](#advanced-features)
  - [Transactions](#transactions)
  - [Serializers](#serializers)
  - [Logging](#logging)
- [Compatibility](#compatibility)
- [Example Project](#example-project)
- [License](#license)

## Installation

```bash
npm install nestjs-dynamoose dynamoose @aws-sdk/client-dynamodb
```

## Quick Start

### 1. Configure the module

Import `DynamooseModule` in your root `AppModule`:

```ts
import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserModule } from './user/user.module';

@Module({
  imports: [DynamooseModule.forRoot(), UserModule],
})
export class AppModule {}
```

### 2. Define a schema and interfaces

Create a [Dynamoose schema](https://dynamoosejs.com/guide/Schema) and corresponding TypeScript interfaces:

```ts
// user.schema.ts
import { Schema } from 'dynamoose';

export const UserSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
});
```

```ts
// user.interface.ts
export interface UserKey {
  id: string;
}

export interface User extends UserKey {
  name: string;
  email?: string;
}
```

> **Note:** `UserKey` contains only the hash key (and optional range key). `User` extends it with all document attributes. This separation enables type-safe operations like `Model.get()` and `Model.update()`.

### 3. Register models in a feature module

```ts
// user.module.ts
import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        options: {
          tableName: 'user',
        },
      },
    ]),
  ],
  providers: [UserService],
})
export class UserModule {}
```

> `options.tableName` is optional. If omitted, the `name` value is used as the table name.

### 4. Inject and use the model

```ts
// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { User, UserKey } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private userModel: Model<User, UserKey>,
  ) {}

  create(user: User) {
    return this.userModel.create(user);
  }

  update(key: UserKey, user: Partial<User>) {
    return this.userModel.update(key, user);
  }

  findOne(key: UserKey) {
    return this.userModel.get(key);
  }

  findAll() {
    return this.userModel.scan().exec();
  }
}
```

## Configuration

### Synchronous Configuration

`forRoot()` accepts an optional `DynamooseModuleOptions` object:

```ts
DynamooseModule.forRoot({
  aws: {
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY',
    region: 'us-east-1',
  },
});
```

#### Options

| Option   | Type                       | Description                                                                            |
| -------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `aws`    | `object`                   | AWS credentials (`accessKeyId`, `secretAccessKey`, `region`)                           |
| `local`  | `boolean \| string`        | Use local DynamoDB (`true` for default endpoint, or a custom URL)                      |
| `ddb`    | `DynamoDB`                 | Provide a custom `@aws-sdk/client-dynamodb` instance                                   |
| `table`  | `TableOptionsOptional`     | Global [table defaults](https://dynamoosejs.com/guide/Table#defaults) for all models   |
| `logger` | `boolean \| LoggerService` | Enable logging (`true` for NestJS default logger, or provide a custom `LoggerService`) |

> **Note:** `aws` and `ddb` are mutually exclusive — provide one or the other.

### Asynchronous Configuration

Use `forRootAsync()` when configuration depends on injected services (e.g., `ConfigService`):

```ts
import { ConfigModule, ConfigService } from '@nestjs/config';

DynamooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    aws: {
      region: configService.get<string>('AWS_REGION'),
    },
  }),
  inject: [ConfigService],
});
```

`forRootAsync()` also supports `useClass` and `useExisting` for factory providers implementing `DynamooseOptionsFactory`.

## Model Registration

### Synchronous Registration

```ts
DynamooseModule.forFeature([
  {
    name: 'User',
    schema: UserSchema,
    options: { tableName: 'user' },
    serializers: {
      frontend: { exclude: ['password'] },
    },
  },
]);
```

### Asynchronous Registration

Use `forFeatureAsync()` for dynamic model configuration with dependency injection:

```ts
DynamooseModule.forFeatureAsync([
  {
    name: 'User',
    useFactory: (_, configService: ConfigService) => ({
      schema: UserSchema,
      options: {
        tableName: configService.get<string>('USER_TABLE_NAME'),
      },
    }),
    inject: [ConfigService],
  },
]);
```

> **Important:** The first parameter of the `useFactory` callback is reserved for internal use. Always use `_,` to ignore it.

The factory can return either:

- A **raw schema** — used directly with the model `name`
- An **object with a `schema` property** — allows specifying `options` and `serializers` alongside the schema

## Usage

The injected model provides full type-safe access to Dynamoose operations:

```ts
// CRUD operations
await this.userModel.create({ id: '1', name: 'Alice' });
await this.userModel.get({ id: '1' });
await this.userModel.update({ id: '1' }, { name: 'Bob' });
await this.userModel.delete({ id: '1' });

// Batch operations
await this.userModel.batchGet([{ id: '1' }, { id: '2' }]);
await this.userModel.batchPut([user1, user2]);
await this.userModel.batchDelete([{ id: '1' }, { id: '2' }]);

// Query and Scan
const results = await this.userModel.query('id').eq('1').exec();
const allUsers = await this.userModel.scan().exec();
```

For complete Dynamoose API documentation, see the [Dynamoose Guide](https://dynamoosejs.com/guide/Model).

## Advanced Features

### Transactions

Extend `TransactionSupport` to perform atomic operations across multiple models:

```ts
import { Injectable } from '@nestjs/common';
import { InjectModel, Model, TransactionSupport } from 'nestjs-dynamoose';
import { User, UserKey } from './user.interface';
import { Account, AccountKey } from './account.interface';

@Injectable()
export class UserService extends TransactionSupport {
  constructor(
    @InjectModel('User')
    private userModel: Model<User, UserKey>,
    @InjectModel('Account')
    private accountModel: Model<Account, AccountKey>,
  ) {
    super();
  }

  async createWithAccount(user: User, account: Account) {
    await this.transaction([
      this.userModel.transaction.create(user),
      this.accountModel.transaction.create(account),
    ]);
  }
}
```

### Serializers

Define serializers to control which fields are included in responses:

```ts
// Registration
DynamooseModule.forFeature([
  {
    name: 'User',
    schema: UserSchema,
    serializers: {
      frontend: { exclude: ['password', 'internalStatus'] },
    },
  },
]);
```

```ts
// Usage
const user = await this.userModel.create(userData);
const safeUser = user.serialize('frontend');

// Batch serialization
const users = await this.userModel.scan().exec();
const safeUsers = this.userModel.serializeMany(users, 'frontend');
```

### Logging

Enable the Dynamoose logger to integrate with NestJS's logging system:

```ts
// Use the default NestJS logger
DynamooseModule.forRoot({
  logger: true,
});

// Or provide a custom LoggerService
DynamooseModule.forRoot({
  logger: customLoggerService,
});
```

When enabled, Dynamoose internal log messages (queries, operations, etc.) are forwarded to your NestJS logger.

## Compatibility

| Package                      | Supported Versions                     |
| ---------------------------- | -------------------------------------- |
| **NestJS**                   | ^8.0.0 \| ^9.0.0 \| ^10.0.0 \| ^11.0.0 |
| **Dynamoose**                | ^3.2.0 \| ^4.0.0                       |
| **@aws-sdk/client-dynamodb** | ^3.0.0                                 |
| **rxjs**                     | ^6.0.0 \| ^7.0.0                       |
| **reflect-metadata**         | ^0.1.13 \| ^0.2.0                      |

## Example Project

See the [AWS NestJS Starter](https://github.com/hardyscc/aws-nestjs-starter) for a complete working example using this library.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

This project is [MIT licensed](LICENSE).
