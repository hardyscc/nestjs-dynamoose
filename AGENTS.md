# AGENTS.md - NestJS-Dynamoose Development Guide

This file provides AI coding agents with essential context for working on the nestjs-dynamoose project.

## Project Overview

**nestjs-dynamoose** is a NestJS module that integrates [Dynamoose](https://dynamoosejs.com/) (a DynamoDB ODM) with NestJS's dependency injection system. It provides decorators, providers, and utilities to seamlessly use DynamoDB models in NestJS applications.

**Key Purpose:** Bridge the gap between Dynamoose's ODM functionality and NestJS's module/DI architecture.

## Architecture & Design Patterns

### Module Structure

The project follows NestJS's standard dynamic module pattern with global and feature modules:

- **`DynamooseCoreModule`** (Global): Handles Dynamoose initialization, AWS configuration, logging setup, and global table defaults
- **`DynamooseModule`** (Feature): Provides model registration via static methods:
  - `forRoot(options)` / `forRootAsync(options)` - Global configuration
  - `forFeature(models)` / `forFeatureAsync(factories)` - Model registration per feature module

### Dependency Injection Pattern

Models are injected using a token-based system:

```typescript
@InjectModel('User')
private userModel: Model<User, UserKey>
```

The `getModelToken(name)` utility in `lib/common/dynamoose.utils.ts` creates tokens by appending `"Model"` to the name (e.g., `"User"` → `"UserModel"`).

### Initialization Flow

1. `forRoot(options)` → `DynamooseCoreModule.forRoot()` → `initialization()` function
2. `initialization()` configures (in order): custom DynamoDB instance OR AWS credentials, local endpoint, table defaults, logger provider
3. The initialization provider uses the `DYNAMOOSE_INITIALIZATION` token and is injected as a dependency into all model providers, ensuring models are created only after Dynamoose is fully configured

### Key Components

| File                                 | Purpose                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `lib/dynamoose.module.ts`            | Main module with `forRoot`, `forRootAsync`, `forFeature`, `forFeatureAsync`                |
| `lib/dynamoose-core.module.ts`       | `@Global()` module: AWS config, local endpoint, table defaults, logger setup               |
| `lib/dynamoose.providers.ts`         | Factory functions that create model DI providers with serializer support                   |
| `lib/dynamoose-logger.provider.ts`   | `LoggerProvider` class that adapts NestJS `LoggerService` to Dynamoose's logger interface  |
| `lib/dynamoose.constants.ts`         | DI tokens: `DYNAMOOSE_MODULE_OPTIONS`, `DYNAMOOSE_INITIALIZATION`                          |
| `lib/common/dynamoose.decorators.ts` | Exports `@InjectModel(name)` decorator                                                     |
| `lib/common/dynamoose.utils.ts`      | `getModelToken(name)` utility — appends `"Model"` suffix                                   |
| `lib/interfaces/`                    | TypeScript interfaces for module options, model definitions, model API types, transactions |

### Logging Architecture

The `LoggerProvider` class in `lib/dynamoose-logger.provider.ts` bridges Dynamoose's internal logging system with NestJS's `LoggerService`:

- Accepts a `LoggerService` instance (or creates a default NestJS `Logger` when `logger: true`)
- Maps Dynamoose log levels (`fatal`, `error`, `warn`, `info`, `debug`, `trace`) to NestJS logger methods
- Formats messages with the Dynamoose category prefix when available
- Registered via `(await logger()).providers.add(...)` in the async `initialization()` function

## Development Workflows

### Build & Quality Scripts

```bash
npm run build    # rm -rf dist && tsc -p tsconfig.json (lib/ → dist/)
npm run lint     # ESLint with --max-warnings 0 (zero tolerance for warnings)
npm run format   # Prettier formatting for lib/**/*.ts
```

### Build Configuration

- **Source:** `lib/` directory (NOT `src/`)
- **Output:** `dist/` directory
- **Root entry:** `index.ts` / `index.js` / `index.d.ts` at project root — all re-export from `./dist`
- **TypeScript:** CommonJS modules, decorators enabled (`emitDecoratorMetadata` + `experimentalDecorators`)
- **Target:** `es6` (ES2015)
- **Strict mode:** `strict: true` with `noImplicitAny: false` override (allows implicit `any` for Dynamoose compatibility)
- **Source maps:** Disabled (`sourceMap: false`)
- **Declarations:** Enabled (`declaration: true`)

### ESLint Configuration

Uses **flat config** format (`eslint.config.mjs`) with `typescript-eslint` and Prettier integration:

**Disabled rules** (intentional for Dynamoose compatibility):

- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unsafe-assignment`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-function-type`, `no-unsafe-argument`, `no-unsafe-return`
- `no-prototype-builtins`

**Warning-level rules** (not errors):

- `@typescript-eslint/require-await`
- `@typescript-eslint/no-misused-promises`
- `no-self-assign`
- `@typescript-eslint/restrict-template-expressions`
- `@typescript-eslint/no-redundant-type-constituents`

`--max-warnings 0` in the lint script means these warnings will still fail CI.

### CI/CD Pipeline

- **GitHub Actions:** Node.js 22.22.2, runs on `ubuntu-latest`
- **Branch:** `master` (push + PR triggers, ignores `README.md` changes)
- **Steps:** `npm ci` → `npm run lint` → `npm run build`
- **Pre-commit hooks (Husky):**
  - `lint-staged` runs Prettier on `*.ts` files
  - `commitlint` enforces Angular commit conventions
- **Renovate bot:** Automated dependency updates (weekends, automerge, unpublish-safe)

### Commit Message Format

Follow Angular conventions:

```
<type>(<scope>): <subject>

Examples:
- feature(core): add support for Dynamoose v4
- bugfix(providers): fix async model factory injection
- docs(readme): improve transaction example
```

Types: `build`, `ci`, `docs`, `feature`, `bugfix`, `perf`, `refactor`, `style`, `test`

## Project-Specific Conventions

### File Organization

```
lib/
├── common/
│   ├── dynamoose.decorators.ts  # @InjectModel() decorator
│   ├── dynamoose.utils.ts       # getModelToken() utility
│   └── index.ts                 # Barrel export
├── interfaces/
│   ├── async-model-factory.interface.ts  # AsyncModelFactory (NOT in barrel export)
│   ├── dynamoose-options.interface.ts    # DynamooseModuleOptions, async options
│   ├── model-definition.interface.ts     # ModelDefinition type
│   ├── model.interface.ts               # Model<Data,Key>, Item<T>, Query, Scan, transactions
│   ├── transaction.interface.ts          # TransactionSupport abstract class
│   └── index.ts                         # Barrel export (excludes async-model-factory)
├── dynamoose.module.ts           # Main DynamooseModule
├── dynamoose-core.module.ts      # Global DynamooseCoreModule
├── dynamoose.providers.ts        # createDynamooseProviders / createDynamooseAsyncProviders
├── dynamoose-logger.provider.ts  # LoggerProvider (NestJS ↔ Dynamoose bridge)
├── dynamoose.constants.ts        # DI token constants
└── index.ts                      # Public API barrel
```

Root-level re-export files (`index.ts`, `index.js`, `index.d.ts`) forward everything from `./dist`.

### Public API Exports

The `lib/index.ts` barrel exports:

- `lib/common` — `InjectModel`, `getModelToken`
- `lib/dynamoose.module` — `DynamooseModule`
- `lib/interfaces` — All interfaces **except** `AsyncModelFactory` (imported directly by internal code)

⚠️ **Note:** `AsyncModelFactory` is NOT exported through the public barrel. Consumers pass plain objects matching the interface shape to `forFeatureAsync()`.

### TypeScript Patterns

**Interface Segregation:** Separate key interfaces from document interfaces

```typescript
// Key interface (hash/range keys only)
export interface UserKey {
  id: string;
}

// Document interface (all attributes)
export interface User extends UserKey {
  name: string;
  email?: string;
}
```

**Type Safety with Dynamoose:**

- Extensive use of `any` types for Dynamoose compatibility (ESLint `no-unsafe-*` rules disabled)
- `noImplicitAny: false` in tsconfig to accommodate Dynamoose's dynamic API surface
- The `model.interface.ts` file provides a comprehensive typed wrapper (`Model<Data, Key, DefaultFields>`) over Dynamoose operations

### Module Registration Patterns

**Synchronous:**

```typescript
DynamooseModule.forFeature([
  {
    name: 'User',
    schema: UserSchema,
    options: { tableName: 'user' },
  },
]);
```

**Async with DI (return schema only):**

```typescript
DynamooseModule.forFeatureAsync([
  {
    name: 'User',
    useFactory: (_, configService: ConfigService) => UserSchema,
    inject: [ConfigService],
  },
]);
```

**Async with DI (return full model definition):**

```typescript
DynamooseModule.forFeatureAsync([
  {
    name: 'User',
    useFactory: (_, configService: ConfigService) => ({
      schema: UserSchema,
      options: { tableName: configService.get('USER_TABLE_NAME') },
      serializers: { frontend: { exclude: ['password'] } },
    }),
    inject: [ConfigService],
  },
]);
```

⚠️ **Important:** First parameter of `useFactory` is always the `DYNAMOOSE_INITIALIZATION` provider (use `_,` to ignore it). The async provider detects the return type by checking for a `schema` property — if present, it's treated as a full model definition; otherwise, it's treated as a raw schema.

### Transaction Support

The `TransactionSupport` abstract class provides transaction capabilities:

```typescript
@Injectable()
export class UserService extends TransactionSupport {
  constructor(
    @InjectModel('User') private userModel: Model<User, UserKey>,
    @InjectModel('Account') private accountModel: Model<Account, AccountKey>,
  ) {
    super();
  }

  async createUserWithAccount(user: User, account: Account) {
    await this.transaction([
      this.userModel.transaction.create(user),
      this.accountModel.transaction.create(account),
    ]);
  }
}
```

## Dependencies & Peer Dependencies

### Peer Dependencies (consumers must install)

- **dynamoose:** ^3.2.0 || ^4.0.0 - DynamoDB ODM
- **@nestjs/common & @nestjs/core:** ^8.0.0 || ^9.0.0 || ^10.0.0 || ^11.0.0
- **@aws-sdk/client-dynamodb:** ^3.0.0
- **rxjs:** ^6.0.0 || ^7.0.0
- **reflect-metadata:** ^0.1.13 || ^0.2.0

### Dev Dependencies (build/lint only)

- **TypeScript:** 5.9.3
- **ESLint:** 9.x (flat config) with `typescript-eslint` 8.x and Prettier plugin
- **NestJS:** 11.1.x (for type-checking during development)
- **dynamoose:** 4.1.x (for type-checking during development)
- **No test framework** — library focused, consumers test integration
- **Renovate bot** automates dependency updates

## Integration Points

### Consumer Integration Flow

1. **Global Config:** `DynamooseModule.forRoot(options)` in `AppModule`
2. **Model Registration:** `DynamooseModule.forFeature([...])` in feature modules
3. **Service Injection:** `@InjectModel('ModelName')` in service constructors

### Configuration Options

```typescript
interface DynamooseModuleOptions {
  aws?: {
    // AWS credentials (mutually exclusive with ddb)
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  local?: boolean | string; // Local DynamoDB endpoint (true = default, string = URL)
  ddb?: DynamoDB; // Custom DynamoDB client instance
  table?: TableOptionsOptional; // Global table defaults (Dynamoose Table.defaults)
  logger?: boolean | LoggerService; // true = NestJS Logger, or custom LoggerService
}
```

### Async Root Configuration

Supports `useFactory`, `useClass`, and `useExisting` patterns:

```typescript
DynamooseModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    aws: {
      region: configService.get('AWS_REGION'),
    },
  }),
  inject: [ConfigService],
});
```

### Advanced Features

**Serializers:** Define custom serializers per model

```typescript
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

Then use: `user.serialize('frontend')` or `Model.serializeMany(items, 'frontend')`

## Testing Considerations

- **No test files in repository** - This is a library focused on integration
- TypeScript config excludes `**/*.spec.ts`
- Consumers should integration test in their applications
- Example project: [aws-nestjs-starter](https://github.com/hardyscc/aws-nestjs-starter)

## Common Tasks & Troubleshooting

### Adding a New Feature

1. Update TypeScript interfaces in `lib/interfaces/`
2. Modify providers or module as needed
3. Update `lib/index.ts` (and `lib/interfaces/index.ts` if adding new interfaces) to export new public API
4. Update README.md with usage examples
5. Run `npm run build` and `npm run lint`
6. Follow commit message conventions

### Updating Dynamoose Version

1. Update peer dependency range in `package.json`
2. Test with both min and max supported versions
3. Update README.md compatibility notes
4. Check for breaking changes in Dynamoose changelog

### Common Gotchas

- ⚠️ **Reserved factory parameter:** First param in `useFactory` (both `forFeatureAsync` and `forRootAsync`) is reserved — always use `_,` to ignore in `forFeatureAsync` (it's the `DYNAMOOSE_INITIALIZATION` token)
- ⚠️ **Global module:** `DynamooseCoreModule` is `@Global()` - its initialization provider is available everywhere after registration
- ⚠️ **Async initialization:** Dynamoose initialization happens via an async provider factory (`initialization()`), not a module constructor
- ⚠️ **Token naming:** `getModelToken(name)` appends `"Model"` suffix (e.g., `"User"` → `"UserModel"`) — injection names must match exactly
- ⚠️ **Async factory return type:** `useFactory` in `forFeatureAsync` can return either a raw schema OR an object with a `schema` property — detection uses `hasOwnProperty('schema')`
- ⚠️ **`AsyncModelFactory` not exported:** The `AsyncModelFactory` interface is not in the public barrel export — consumers rely on structural typing
- ⚠️ **Typo in constants:** `DYNAMOOSE_INITIALIZATION` is defined as `'DynamooseInitialiation'` (missing an 'z') — preserved for backward compatibility

## External Resources

- **Documentation:** [Dynamoose Docs](https://dynamoosejs.com/)
- **Example Project:** [aws-nestjs-starter](https://github.com/hardyscc/aws-nestjs-starter)
- **Issues:** Use GitHub issue templates (`.github/ISSUE_TEMPLATE.md`)
- **PRs:** Use PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
- **Questions:** Stack Overflow with tag `nestjs-dynamoose`

## Release Process

1. Update version following semantic versioning
2. Run `npm run build` to ensure clean compilation
3. Run `npm run release` (uses `release-it`)
4. Publish: `npm run publish:npm` or `npm run publish:next` (for pre-release tags)

## Security & Best Practices

- Never commit AWS credentials
- Use environment variables for sensitive configuration
- Prefer `forRootAsync()` with `ConfigService` for production
- Use IAM roles in AWS environments (don't hardcode credentials)
- Enable logger in development, disable or use custom logger in production

---

**Last Updated:** 2026-03-31

This guide should be updated when major architectural changes occur.
