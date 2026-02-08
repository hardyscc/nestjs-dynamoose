# AGENTS.md - NestJS-Dynamoose Development Guide

This file provides AI coding agents with essential context for working on the nestjs-dynamoose project.

## Project Overview

**nestjs-dynamoose** is a NestJS module that integrates [Dynamoose](https://dynamoosejs.com/) (a DynamoDB ODM) with NestJS's dependency injection system. It provides decorators, providers, and utilities to seamlessly use DynamoDB models in NestJS applications.

**Key Purpose:** Bridge the gap between Dynamoose's ODM functionality and NestJS's module/DI architecture.

## Architecture & Design Patterns

### Module Structure

The project follows NestJS's standard dynamic module pattern with global and feature modules:

- **`DynamooseCoreModule`** (Global): Handles Dynamoose initialization, AWS configuration, and global setup
- **`DynamooseModule`** (Feature): Provides model registration via static methods:
  - `forRoot(options)` / `forRootAsync(options)` - Global configuration
  - `forFeature(models)` / `forFeatureAsync(factories)` - Model registration per feature module

### Dependency Injection Pattern

Models are injected using a token-based system:

```typescript
@InjectModel('User') 
private userModel: Model<User, UserKey>
```

The `getModelToken(name)` utility in `lib/common/dynamoose.utils.ts` creates consistent tokens for model providers.

### Key Components

| File | Purpose |
|------|---------|
| `lib/dynamoose.module.ts` | Main module with static registration methods |
| `lib/dynamoose-core.module.ts` | Global module handling Dynamoose initialization |
| `lib/dynamoose.providers.ts` | Creates model providers with proper DI |
| `lib/common/dynamoose.decorators.ts` | Exports `@InjectModel()` decorator |
| `lib/common/dynamoose.utils.ts` | Token generation utilities |
| `lib/interfaces/` | TypeScript interfaces for module options, models, transactions |

## Development Workflows

### Build & Quality Scripts

```bash
npm run build    # Compile TypeScript (lib/ → dist/)
npm run lint     # ESLint with Prettier integration
npm run format   # Prettier formatting for lib/**/*.ts
```

### Build Configuration

- **Source:** `lib/` directory (NOT `src/`)
- **Output:** `dist/` directory
- **Entry point:** `index.ts` exports `./dist`
- **TypeScript:** CommonJS modules, decorators enabled, strict mode
- **Target:** ES2021, Node.js compatible

### CI/CD Pipeline

- **GitHub Actions:** Node.js 22.17.1
- **Steps:** `npm ci` → `npm run lint` → `npm run build`
- **Pre-commit hooks:** 
  - `lint-staged` runs Prettier on `*.ts` files
  - `commitlint` enforces Angular commit conventions

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
├── common/               # Decorators & utilities
├── interfaces/           # TypeScript interfaces with barrel exports
├── dynamoose.module.ts   # Main module
├── dynamoose-core.module.ts
├── dynamoose.providers.ts
├── dynamoose.constants.ts
└── index.ts              # Public API
```

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
- Extensive use of `any` types for Dynamoose compatibility
- ESLint rules disabled: `@typescript-eslint/no-unsafe-*`, `@typescript-eslint/no-explicit-any`
- This is intentional due to Dynamoose's dynamic nature

### Module Registration Patterns

**Synchronous:**
```typescript
DynamooseModule.forFeature([{
  name: 'User',
  schema: UserSchema,
  options: { tableName: 'user' }
}])
```

**Async with DI:**
```typescript
DynamooseModule.forFeatureAsync([{
  name: 'User',
  useFactory: (_, configService: ConfigService) => ({
    schema: UserSchema,
    options: { tableName: configService.get('USER_TABLE_NAME') }
  }),
  inject: [ConfigService]
}])
```

⚠️ **Important:** First parameter of `useFactory` is reserved (ignore with `_,`)

### Transaction Support

The `TransactionSupport` abstract class provides transaction capabilities:

```typescript
@Injectable()
export class UserService extends TransactionSupport {
  constructor(
    @InjectModel('User') private userModel: Model<User, UserKey>,
    @InjectModel('Account') private accountModel: Model<Account, AccountKey>
  ) {
    super();
  }

  async createUserWithAccount(user: User, account: Account) {
    await this.transaction([
      this.userModel.transaction.create(user),
      this.accountModel.transaction.create(account)
    ]);
  }
}
```

## Dependencies & Peer Dependencies

### Core Dependencies

- **dynamoose:** ^3.2.0 || ^4.0.0 - DynamoDB ODM
- **@nestjs/common & @nestjs/core:** ^8.0.0 || ^9.0.0 || ^10.0.0 || ^11.0.0
- **@aws-sdk/client-dynamodb:** ^3.0.0
- **rxjs:** ^6.0.0 || ^7.0.0
- **reflect-metadata:** ^0.1.13 || ^0.2.0

### Dev Dependencies Philosophy

- Minimal dev dependencies (only build/lint tooling)
- No test framework (library focused, consumers test integration)
- ESLint with Prettier integration
- TypeScript 5.9+

## Integration Points

### Consumer Integration Flow

1. **Global Config:** `DynamooseModule.forRoot(options)` in `AppModule`
2. **Model Registration:** `DynamooseModule.forFeature([...])` in feature modules
3. **Service Injection:** `@InjectModel('ModelName')` in service constructors

### Configuration Options

```typescript
interface DynamooseModuleOptions {
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  local?: boolean | string;  // Local DynamoDB endpoint
  ddb?: DynamoDB;            // Custom DynamoDB instance
  table?: TableOptionsOptional;  // Global table defaults
  logger?: boolean | LoggerService;  // Logging configuration
}
```

### Advanced Features

**Serializers:** Define custom serializers per model

```typescript
DynamooseModule.forFeature([{
  name: 'User',
  schema: UserSchema,
  serializers: {
    frontend: { exclude: ['password', 'internalStatus'] }
  }
}])
```

Then use: `user.serialize('frontend')`

## Testing Considerations

- **No test files in repository** - This is a library focused on integration
- TypeScript config excludes `**/*.spec.ts`
- Consumers should integration test in their applications
- Example project: [aws-nestjs-starter](https://github.com/hardyscc/aws-nestjs-starter)

## Common Tasks & Troubleshooting

### Adding a New Feature

1. Update TypeScript interfaces in `lib/interfaces/`
2. Modify providers or module as needed
3. Update `index.ts` to export new public API
4. Update README.md with usage examples
5. Run `npm run build` and `npm run lint`
6. Follow commit message conventions

### Updating Dynamoose Version

1. Update peer dependency range in `package.json`
2. Test with both min and max supported versions
3. Update README.md compatibility notes
4. Check for breaking changes in Dynamoose changelog

### Common Gotchas

- ⚠️ **Reserved factory parameter:** First param in `useFactory` is reserved, always ignore with `_,`
- ⚠️ **Global module:** `DynamooseCoreModule` is `@Global()` - models available everywhere after registration
- ⚠️ **Async initialization:** Dynamoose initialization happens via provider factory, not module constructor
- ⚠️ **Token naming:** Model tokens use `getModelToken(name)` - must match exactly for injection

## External Resources

- **Documentation:** [Dynamoose Docs](https://dynamoosejs.com/)
- **Example Project:** [aws-nestjs-starter](https://github.com/hardyscc/aws-nestjs-starter)
- **Issues:** Use GitHub issue templates
- **Questions:** Stack Overflow with tag `nestjs-dynamoose`

## Release Process

1. Update version following semantic versioning
2. Run `npm run build` to ensure clean compilation
3. Run `npm run release` (uses `release-it`)
4. Publish: `npm run publish:npm` or `npm run publish:next`

## Security & Best Practices

- Never commit AWS credentials
- Use environment variables for sensitive configuration
- Prefer `forRootAsync()` with `ConfigService` for production
- Use IAM roles in AWS environments (don't hardcode credentials)
- Enable logger in development, disable or use custom logger in production

---

**Last Updated:** 2025-01-30

This guide should be updated when major architectural changes occur.
