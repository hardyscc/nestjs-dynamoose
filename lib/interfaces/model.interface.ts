type PopulateOptions = {
  path: string;
  model: string;
  populate?: PopulateOptions;
};

export interface PutOptions {
  overwrite?: boolean;
  updateTimestamps?: boolean;
  updateExpires?: boolean;
  condition?: string;
  conditionNames?: any;
  conditionValues?: any;
}

export interface Model<DataSchema, KeySchema> {
  new (value?: DataSchema): ModelSchema<DataSchema>;
  (value?: DataSchema): ModelSchema<DataSchema>;
  readonly prototype: ModelSchema<DataSchema>;

  batchPut(
    items: DataSchema[],
    options?: PutOptions,
    callback?: (err: Error, items: ModelSchema<DataSchema>[]) => void,
  ): Promise<ModelSchema<DataSchema>[]>;
  batchPut(
    items: DataSchema[],
    callback?: (err: Error, items: ModelSchema<DataSchema>[]) => void,
  ): Promise<ModelSchema<DataSchema>[]>;

  create(
    item: DataSchema,
    options?: PutOptions,
    callback?: (err: Error, model: ModelSchema<DataSchema>) => void,
  ): Promise<ModelSchema<DataSchema>>;
  create(
    item: DataSchema,
    callback?: (err: Error, model: ModelSchema<DataSchema>) => void,
  ): Promise<ModelSchema<DataSchema>>;
  create(
    item: DataSchema,
    options?: PutOptions,
  ): Promise<ModelSchema<DataSchema>>;

  get(
    key: KeySchema,
    callback?: (err: Error, data: DataSchema) => void,
  ): Promise<ModelSchema<DataSchema> | undefined>;
  batchGet(
    key: KeySchema[],
    callback?: (err: Error, data: DataSchema) => void,
  ): Promise<ModelSchema<DataSchema>[]>;

  delete(key: KeySchema, callback?: (err: Error) => void): Promise<undefined>;
  batchDelete(
    keys: KeySchema[],
    callback?: (err: Error) => void,
  ): Promise<undefined>;

  query(
    query?: QueryFilter,
    callback?: (err: Error, results: ModelSchema<DataSchema>[]) => void,
  ): QueryInterface<
    ModelSchema<DataSchema>,
    QueryResult<ModelSchema<DataSchema>>
  >;
  queryOne(
    query?: QueryFilter,
    callback?: (err: Error, results: ModelSchema<DataSchema>) => void,
  ): QueryInterface<ModelSchema<DataSchema>, ModelSchema<DataSchema>>;
  scan(
    filter?: ScanFilter,
    callback?: (err: Error, results: ModelSchema<DataSchema>[]) => void,
  ): ScanInterface<ModelSchema<DataSchema>>;

  update(
    key: KeySchema,
    update: UpdateUpdate<DataSchema>,
    options: UpdateOptions,
    callback: (err: Error, items: ModelSchema<DataSchema>[]) => void,
  ): void;
  update(
    key: KeySchema,
    update: UpdateUpdate<DataSchema>,
    callback: (err: Error, items: ModelSchema<DataSchema>[]) => void,
  ): void;
  update(
    key: KeySchema,
    update: UpdateUpdate<DataSchema>,
    options?: UpdateOptions,
  ): Promise<ModelSchema<DataSchema>>;

  transaction: ModelTransactionConstructor<DataSchema, KeySchema>;
}
type ModelSchema<T> = T;

/**
 * Update
 */

/**
 * Updates and existing item in the table. Three types of updates: $PUT, $ADD, and $DELETE.
 * Put is the default behavior.
 */
type UpdateUpdate<DataSchema> =
  | Partial<DataSchema>
  | { $PUT: Partial<DataSchema> }
  | { $ADD: Partial<DataSchema> }
  | { $DELETE: Partial<DataSchema> };

export interface UpdateOptions {
  allowEmptyArray?: boolean;
  createRequired?: boolean;
  updateTimestamps?: boolean;
  returnValues?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW';
  condition?: string;
  conditionNames?: any;
  conditionValues?: any;
}

/**
 * Query
 */
type QueryFilter = any;
export interface QueryInterface<T, R> {
  exec(callback?: (err: Error, result: R) => void): Promise<R>;
  all(delay?: number, max?: number): QueryInterface<T, R>;
  where(rangeKey: string): QueryInterface<T, R>;
  filter(filter: string): QueryInterface<T, R>;
  and(): QueryInterface<T, R>;
  or(): QueryInterface<T, R>;
  not(): QueryInterface<T, R>;
  null(): QueryInterface<T, R>;
  eq(value: any): QueryInterface<T, R>;
  lt(value: any): QueryInterface<T, R>;
  le(value: any): QueryInterface<T, R>;
  ge(value: any): QueryInterface<T, R>;
  gt(value: any): QueryInterface<T, R>;
  beginsWith(value: string): QueryInterface<T, R>;
  between(valueA: any, valueB: any): QueryInterface<T, R>;
  contains(value: string): QueryInterface<T, R>;
  in(values: any[]): QueryInterface<T, R>;
  limit(limit: number): QueryInterface<T, R>;
  consistent(): QueryInterface<T, R>;
  descending(): QueryInterface<T, R>;
  ascending(): QueryInterface<T, R>;
  startAt(key: QueryKey): QueryInterface<T, R>;
  attributes(attributes: string[]): QueryInterface<T, R>;
  count(): QueryInterface<T, R>;
  counts(): QueryInterface<T, R>;
  using(indexName: string): QueryInterface<T, R>;
  /* v2 */
  exists(): QueryInterface<T, R>;
}
export interface QueryResult<T> extends Array<T> {
  count: number;
  lastKey?: QueryKey;
  queriedCount?: number;
  timesQueried: number;
}
type QueryKey = any;

/**
 * Scan
 */
type ScanFilter = string | any;

export interface ScanInterface<T> {
  exec(
    callback?: (err: Error, result: ScanResult<T>) => void,
  ): Promise<ScanResult<T>>;
  all(delay?: number, max?: number): ScanInterface<T>;
  parallel(totalSegments: number): ScanInterface<T>;
  using(indexName: string): ScanInterface<T>;
  consistent(filter?: any): ScanInterface<T>;
  where(filter: any): ScanInterface<T>;
  filter(filter: any): ScanInterface<T>;
  and(): ScanInterface<T>;
  not(): ScanInterface<T>;
  null(): ScanInterface<T>;
  eq(value: any): ScanInterface<T>;
  lt(value: any): ScanInterface<T>;
  le(value: any): ScanInterface<T>;
  ge(value: any): ScanInterface<T>;
  gt(value: any): ScanInterface<T>;
  beginsWith(value: any): ScanInterface<T>;
  between(valueA: any, valueB: any): ScanInterface<T>;
  contains(value: any): ScanInterface<T>;
  in(value: any): ScanInterface<T>;
  limit(limit: number): ScanInterface<T>;
  startAt(key: ScanKey): ScanInterface<T>;
  attributes(value: any): ScanInterface<T>;
  count(): ScanInterface<T>;
  counts(): ScanInterface<T>;
  /* v2 */
  exists(): ScanInterface<T>;
}

export interface ScanResult<ModelData> extends Array<ModelData> {
  count: number;
  lastKey?: ScanKey;
  scannedCount?: number;
  timesScanned: number;
}

type ScanKey = any;

export interface VirtualType {
  (options: any, name: string);
  applyVirtuals(model: any): void;
  get(fn: any): any;
  set(fn: any): any;
}

/**
 * Transaction
 */
export interface ModelTransactionConstructor<DataSchema, KeySchema> {
  new (value?: DataSchema): ModelSchema<DataSchema>;
  (value?: DataSchema): ModelSchema<DataSchema>;
  readonly prototype: ModelSchema<DataSchema>;

  create(
    item: DataSchema,
    options?: PutOptions,
    callback?: (err: Error, model: ModelSchema<DataSchema>) => void,
  ): Promise<ModelSchema<DataSchema>>;
  create(
    item: DataSchema,
    callback?: (err: Error, model: ModelSchema<DataSchema>) => void,
  ): Promise<ModelSchema<DataSchema>>;
  create(
    item: DataSchema,
    options?: PutOptions,
  ): Promise<ModelSchema<DataSchema>>;

  get(
    key: KeySchema,
    callback?: (err: Error, data: DataSchema) => void,
  ): Promise<ModelSchema<DataSchema> | undefined>;

  delete(key: KeySchema, callback?: (err: Error) => void): Promise<undefined>;

  update(
    key: KeySchema,
    update: UpdateUpdate<DataSchema>,
    options: UpdateOptions,
    callback: (err: Error, items: ModelSchema<DataSchema>[]) => void,
  ): void;
  update(
    key: KeySchema,
    update: UpdateUpdate<DataSchema>,
    callback: (err: Error, items: ModelSchema<DataSchema>[]) => void,
  ): void;
  update(
    key: KeySchema,
    update: UpdateUpdate<DataSchema>,
    options?: UpdateOptions,
  ): Promise<ModelSchema<DataSchema>>;

  conditionCheck(key: KeySchema, options?: ConditionOptions): void;
}
export interface ConditionOptions {
  condition: string;
  conditionNames: object;
  conditionValues: object;
}
