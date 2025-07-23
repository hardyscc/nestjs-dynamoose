# NestJS-Dynamoose AI Coding Instructions

## Project Overview

This is a NestJS module that integrates Dynamoose (DynamoDB ODM) with NestJS's dependency injection system. The module provides decorators, providers, and utilities to seamlessly use DynamoDB models in NestJS applications.

## Architecture & Key Patterns

### Module Structure

- **Core Module (`DynamooseCoreModule`)**: Global module that handles Dynamoose initialization and configuration
- **Feature Module (`DynamooseModule`)**: Provides model registration via `forFeature()` and `forFeatureAsync()`
- **Provider System**: Creates injectable providers for each Dynamoose model using token-based injection

### Key Components

- **`lib/dynamoose.module.ts`**: Main module with `forRoot()`, `forRootAsync()`, `forFeature()`, `forFeatureAsync()` static methods
- **`lib/dynamoose-core.module.ts`**: Handles Dynamoose initialization, AWS configuration, and global setup
- **`lib/dynamoose.providers.ts`**: Creates model providers with proper dependency injection
- **`lib/common/dynamoose.decorators.ts`**: Exports `@InjectModel(name)` decorator for model injection

### Injection Pattern

Models are injected using a token-based system:

```typescript
@InjectModel('User') private userModel: Model<User, UserKey>
```

The `getModelToken()` utility creates consistent tokens for model injection.

### Transaction Support

The `TransactionSupport` abstract class in `lib/interfaces/transaction.interface.ts` provides transaction capabilities by wrapping Dynamoose's transaction API.

## Development Workflows

### Build & Quality

- **Build**: `npm run build` - Compiles TypeScript to `dist/` using `tsconfig.json`
- **Lint**: `npm run lint` - ESLint with TypeScript, Prettier integration
- **Format**: `npm run format` - Prettier formatting for `lib/**/*.ts`

### Key Build Configuration

- Source: `lib/` directory, output: `dist/`
- Entry point: `index.ts` exports `./dist`
- TypeScript: CommonJS modules, decorators enabled, strict mode
- ESLint: Relaxed `@typescript-eslint/no-unsafe-*` rules for Dynamoose integration

### CI/CD

- GitHub Actions workflow runs on Node.js 22.17.1
- Pipeline: `npm ci` → `npm run lint` → `npm run build`
- Pre-commit hooks: lint-staged with Prettier, commitlint with Angular conventions

## Project-Specific Conventions

### File Organization

- All source code in `lib/` (not `src/`)
- Interfaces grouped in `lib/interfaces/` with barrel exports
- Common utilities in `lib/common/`
- Constants in `lib/dynamoose.constants.ts`

### TypeScript Patterns

- Extensive use of `any` types for Dynamoose compatibility (ESLint rules disabled)
- Interface segregation: separate `UserKey` (keys) and `User` (full document) interfaces
- Factory pattern for async module configuration with dependency injection

### Module Registration Patterns

- **Synchronous**: `forFeature([{ name: 'User', schema: UserSchema, options: {...} }])`
- **Async with DI**: `forFeatureAsync([{ name: 'User', useFactory: (_, config) => {...}, inject: [ConfigService] }])`
- First parameter of `useFactory` is reserved (use `_,` to ignore)

### Testing Considerations

- No test files in repository (peer dependency focused library)
- TypeScript excludes `**/*.spec.ts` files
- Focus on type safety and integration testing in consumer applications

## Integration Points

### External Dependencies

- **Dynamoose**: Core ODM functionality, model creation, transactions
- **NestJS**: Module system, dependency injection, decorators
- **AWS SDK**: DynamoDB client configuration (peer dependency)

### Consumer Integration

- Consumers use `DynamooseModule.forRoot()` in AppModule for global configuration
- Feature modules use `DynamooseModule.forFeature()` to register specific models
- Services inject models using `@InjectModel('ModelName')` decorator

### Configuration Flow

1. `forRoot(options)` → `DynamooseCoreModule.forRoot()` → `initialization()`
2. AWS/DynamoDB configuration via `aws.ddb.set()`
3. Model registration via providers created in `dynamoose.providers.ts`
4. Token-based injection using `getModelToken()` utility
