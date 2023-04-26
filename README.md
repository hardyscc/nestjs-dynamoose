<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

<p align="center">
<a href="https://www.npmjs.com/package/nestjs-dynamoose"><img src="https://img.shields.io/npm/v/nestjs-dynamoose" alt="NPM Version"></a>
<a href="https://github.com/hardyscc/nestjs-dynamoose/blob/master/LICENSE"><img src="https://img.shields.io/github/license/hardyscc/nestjs-dynamoose" alt="Package License"></a>
<a href="https://www.npmjs.com/package/nestjs-dynamoose"><img src="https://img.shields.io/npm/dm/nestjs-dynamoose.svg" alt="NPM Downloads" /></a>
<a href="https://github.com/hardyscc/nestjs-dynamoose/actions"><img src="https://github.com/hardyscc/nestjs-dynamoose/workflows/Node.js%20CI/badge.svg" alt="CI"></a>
<a href="https://twitter.com/hardyscchk"><img src="https://img.shields.io/twitter/follow/hardyscchk.svg?style=social&label=Follow"></a>
</p>

## Description

[Dynamoose](https://dynamoosejs.com/) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm install --save nestjs-dynamoose dynamoose
```

## Example Project

A [AWS NestJS Starter](https://github.com/hardyscc/aws-nestjs-starter) project has been created to demo the usage of this library.

## Quick Start

**1. Add import into your app module**

`src/app.module.ts`

```ts
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserModule } from './user/user.module';

@Module({
 imports: [
   DynamooseModule.forRoot(),
   UserModule,
 ],
})
export class AppModule {
```

`forRoot()` optionally accepts the following options defined by `DynamooseModuleOptions`:

```ts
interface DynamooseModuleOptions {
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
```

There is also `forRootAsync(options: DynamooseModuleAsyncOptions)` if you want to use a factory with dependency injection.

**2. Create a schema**

`src/user/user.schema.ts`

```ts
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

`src/user/user.interface.ts`

```ts
export interface UserKey {
  id: string;
}

export interface User extends UserKey {
  name: string;
  email?: string;
}
```

`UserKey` holds the hashKey/partition key and (optionally) the rangeKey/sort key. `User` holds all attributes of the document/item. When creating this two interfaces and using when injecting your model you will have typechecking when using operations like `Model.update()`.

**3. Add the models you want to inject to your modules**

This can be a feature module (as shown below) or within the root AppModule next to `DynamooseModule.forRoot()`.

`src/user/user.module.ts`

```ts
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    DynamooseModule.forFeature([{
      name: 'User',
      schema: UserSchema,
      options: {
        tableName: 'user',
      },
    }]),
  ],
  providers: [
    UserService,
    ...
  ],
})
export class UserModule {}
```

> `options.tableName` is optional. If it is not provided, `name` will be used as the table name.

There is also `forFeatureAsync(factories?: AsyncModelFactory[])` if you want to use a factory with dependency injection. Notes that the first parameter of the `useFactory` callback is reserved for future use, so please just add `_,` to ignore it.

The following example will use `USER_TABLE_NAME` environment variable as the table name.

```ts
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamooseModule.forFeatureAsync([
      {
        name: 'User',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: UserSchema,
            options: {
              tableName: configService.get<string>('USER_TABLE_NAME'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    UserService,
    ...
  ],
})
export class UserModule {}
```

**4. Inject and use your model**

`src/user/user.service.ts`

```ts
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

## Additional Example

**1. Transaction Support**

Both `User` and `Account` model objects will commit in same transaction.

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

  async create(user: User, account: Account) {
    await this.transaction([
      this.userModel.transaction.create(user),
      this.accountModel.transaction.create(account),
    ]);
  }
}
```

**2. Serializers Support**

Define the additional `serializers` under `DynamooseModule.forFeature()`.

```ts
@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        serializers: {
          frontend: { exclude: ['status'] },
        },
      },
    ]),
  ],
  ...
})
export class UserModule {}
```

Call the `serialize` function to exclude the `status` field.

```ts
@Injectable()
export class UserService {
  ...
  async create(user: User) {
    const createdUser = await this.userModel.create(user);
    return createdUser.serialize('frontend');
  }
  ...
}
```

## License

Dynamoose module for Nest is [MIT licensed](LICENSE).
