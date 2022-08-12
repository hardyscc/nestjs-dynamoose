import * as DynamoDB from "@aws-sdk/client-dynamodb";
import {
  Condition,
  ConditionFunction,
  ConditionInitializer,
} from 'dynamoose/dist/Condition';
import { SortOrder } from 'dynamoose/dist/General';
import { PopulateSettings } from 'dynamoose/dist/Populate';

type OptionalOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>> &
  Partial<Pick<T, Extract<keyof T, K>>>;

export declare type ObjectType = {
  [key: string]: any;
};

export declare type CallbackType<R, E> = (
  error?: E | null,
  response?: R,
) => void;

export interface DocumentArray<T> extends Array<T> {
  populate(): Promise<DocumentArray<T>>;
  toJSON(): ObjectType;
}

export interface DocumentRetrieverResponse<T> extends Array<T> {
  lastKey?: ObjectType;
  count: number;
}

export interface ScanResponse<T> extends DocumentRetrieverResponse<T> {
  scannedCount: number;
  timesScanned: number;
}

export interface QueryResponse<T> extends DocumentRetrieverResponse<T> {
  queriedCount: number;
  timesQueried: number;
}

export interface UnprocessedItems<T> {
  unprocessedItems: T[];
}
export interface ModelGetSettings {
  return?: 'document' | 'request';
  attributes?: string[];
  consistent?: boolean;
}
export interface ModelDeleteSettings {
  return?: null | 'request';
  condition?: Condition;
}
export interface ModelBatchPutSettings {
  return?: 'response' | 'request';
}
export interface ModelUpdateSettings {
  return?: 'document' | 'request';
  condition?: Condition;
  returnValues?: DynamoDB.ReturnValue;
}
export interface ModelBatchGetDocumentsResponse<T> extends DocumentArray<T> {
  unprocessedKeys: ObjectType[];
}
export interface ModelBatchGetSettings {
  return?: 'documents' | 'request';
  attributes?: string[];
}
export interface ModelBatchDeleteSettings {
  return?: 'response' | 'request';
}

export interface DocumentSaveSettings {
  overwrite?: boolean;
  return?: 'request' | 'document';
}
export type UpdatePartial<T> =
  | Partial<T>
  | { $SET: Partial<T> }
  | { $ADD: Partial<T> }
  | { $REMOVE: Partial<T> };

export interface SerializerOptions {
  include?: string[];
  exclude?: string[];
  modify?: (serialized: ObjectType, original: ObjectType) => ObjectType;
}

export type Document<T> = {
  populate(): Promise<Document<T>>;
  populate(callback: CallbackType<Document<T>, any>): void;
  populate(settings: PopulateSettings): Promise<Document<T>>;
  populate(
    settings: PopulateSettings,
    callback: CallbackType<Document<T>, any>,
  ): void;
  serialize(nameOrOptions: SerializerOptions | string): ObjectType;
  toJSON(): ObjectType;
  original(): ObjectType;
} & T;

export interface Model<Data, Key, DefaultFields extends keyof any = ''> {
  query(condition?: ConditionInitializer): Query<Document<Data>, Key>;

  scan(condition?: ConditionInitializer): Scan<Document<Data>, Key>;

  batchGet(
    keys: Key[],
  ): Promise<ModelBatchGetDocumentsResponse<Document<Data>>>;
  batchGet(
    keys: Key[],
    callback: CallbackType<
      ModelBatchGetDocumentsResponse<Document<Data>>,
      any
    >,
  ): void;
  batchGet(
    keys: Key[],
    settings: ModelBatchGetSettings & {
      return: 'documents';
    },
  ): Promise<ModelBatchGetDocumentsResponse<Document<Data>>>;
  batchGet(
    keys: Key[],
    settings: ModelBatchGetSettings & {
      return: 'documents';
    },
    callback: CallbackType<
      ModelBatchGetDocumentsResponse<Document<Data>>,
      any
    >,
  ): void;
  batchGet(
    keys: Key[],
    settings: ModelBatchGetSettings & {
      return: 'request';
    },
  ): DynamoDB.BatchGetItemInput;
  batchGet(
    keys: Key[],
    settings: ModelBatchGetSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.BatchGetItemInput, any>,
  ): void;

  batchPut(
    documents: OptionalOmit<Data, DefaultFields>[],
  ): Promise<UnprocessedItems<Document<Data>>>;
  batchPut(
    documents: OptionalOmit<Data, DefaultFields>[],
    callback: CallbackType<UnprocessedItems<Document<Data>>, any>,
  ): void;
  batchPut(
    documents: OptionalOmit<Data, DefaultFields>[],
    settings: ModelBatchPutSettings & {
      return: 'request';
    },
  ): Promise<DynamoDB.BatchWriteItemInput>;
  batchPut(
    documents: OptionalOmit<Data, DefaultFields>[],
    settings: ModelBatchPutSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.BatchWriteItemInput, any>,
  ): void;
  batchPut(
    documents: OptionalOmit<Data, DefaultFields>[],
    settings: ModelBatchPutSettings & {
      return: 'response';
    },
  ): Promise<UnprocessedItems<Document<Data>>>;
  batchPut(
    documents: OptionalOmit<Data, DefaultFields>[],
    settings: ModelBatchPutSettings & {
      return: 'response';
    },
    callback: CallbackType<UnprocessedItems<Document<Data>>, any>,
  ): void;

  batchDelete(keys: Key[]): Promise<UnprocessedItems<Key>>;
  batchDelete(
    keys: Key[],
    callback: CallbackType<UnprocessedItems<Key>, any>,
  ): void;
  batchDelete(
    keys: Key[],
    settings: ModelBatchDeleteSettings & {
      return: 'response';
    },
  ): Promise<UnprocessedItems<Key>>;
  batchDelete(
    keys: Key[],
    settings: ModelBatchDeleteSettings & {
      return: 'response';
    },
    callback: CallbackType<UnprocessedItems<Key>, any>,
  ): Promise<UnprocessedItems<Key>>;
  batchDelete(
    keys: Key[],
    settings: ModelBatchDeleteSettings & {
      return: 'request';
    },
  ): DynamoDB.BatchWriteItemInput;
  batchDelete(
    keys: Key[],
    settings: ModelBatchDeleteSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.BatchWriteItemInput, any>,
  ): void;

  update(obj: Data): Promise<Document<Data>>;
  update(obj: Data, callback: CallbackType<Document<Data>, any>): void;
  update(keyObj: Key, updateObj: UpdatePartial<Data>): Promise<Document<Data>>;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    callback: CallbackType<Document<Data>, any>,
  ): void;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings & {
      return: 'document';
    },
  ): Promise<Document<Data>>;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings & {
      return: 'document';
    },
    callback: CallbackType<Document<Data>, any>,
  ): void;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings & {
      return: 'request';
    },
  ): Promise<DynamoDB.UpdateItemInput>;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.UpdateItemInput, any>,
  ): void;

  create(document: OptionalOmit<Data, DefaultFields>): Promise<Document<Data>>;
  create(
    document: OptionalOmit<Data, DefaultFields>,
    callback: CallbackType<Document<Data>, any>,
  ): void;
  create(
    document: OptionalOmit<Data, DefaultFields>,
    settings: DocumentSaveSettings & {
      return: 'request';
    },
  ): Promise<DynamoDB.PutItemInput>;
  create(
    document: OptionalOmit<Data, DefaultFields>,
    settings: DocumentSaveSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.PutItemInput, any>,
  ): void;
  create(
    document: OptionalOmit<Data, DefaultFields>,
    settings: DocumentSaveSettings & {
      return: 'document';
    },
  ): Promise<Document<Data>>;
  create(
    document: OptionalOmit<Data, DefaultFields>,
    settings: DocumentSaveSettings & {
      return: 'document';
    },
    callback: CallbackType<Document<Data>, any>,
  ): void;

  delete(key: Key): Promise<void>;
  delete(key: Key, callback: CallbackType<void, any>): void;
  delete(
    key: Key,
    settings: ModelDeleteSettings & {
      return: 'request';
    },
  ): DynamoDB.DeleteItemInput;
  delete(
    key: Key,
    settings: ModelDeleteSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.DeleteItemInput, any>,
  ): void;
  delete(
    key: Key,
    settings: ModelDeleteSettings & {
      return: null;
    },
  ): Promise<void>;
  delete(
    key: Key,
    settings: ModelDeleteSettings & {
      return: null;
    },
    callback: CallbackType<void, any>,
  ): void;

  get(key: Key): Promise<Document<Data>>;
  get(key: Key, callback: CallbackType<Document<Data>, any>): void;
  get(
    key: Key,
    settings: ModelGetSettings & {
      return: 'document';
    },
  ): Promise<Document<Data>>;
  get(
    key: Key,
    settings: ModelGetSettings & {
      return: 'document';
    },
    callback: CallbackType<Document<Data>, any>,
  ): void;
  get(
    key: Key,
    settings: ModelGetSettings & {
      return: 'request';
    },
  ): DynamoDB.GetItemInput;
  get(
    key: Key,
    settings: ModelGetSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.GetItemInput, any>,
  ): void;

  transaction: TransactionType<Data, Key>;

  serializeMany(
    documentsArray: Data[],
    nameOrOptions: SerializerOptions | string,
  ): ObjectType[];
}

export interface BasicOperators<T> {
  getRequest(): Promise<any>;
  all(delay?: number, max?: number): T;
  limit(value: number): T;
  startAt(value: ObjectType): T;
  attributes(value: string[]): T;
  count(): T;
  consistent(): T;
  using(value: string): T;
  and(): T;
  or(): T;
  not(): T;
  parenthesis(value: Condition | ConditionFunction): T;
  group(value: Condition | ConditionFunction): T;
  where(key: string): T;
  filter(key: string): T;
  attribute(key: string): T;
  eq(value: any): T;
  lt(value: any): T;
  le(value: any): T;
  gt(value: any): T;
  ge(value: any): T;
  beginsWith(value: any): T;
  contains(value: any): T;
  exists(): T;
  in(value: any): T;
  between(...values: any[]): T;
}

export interface Query<Data, Key> extends BasicOperators<Query<Data, Key>> {
  exec(): Promise<QueryResponse<Data>>;
  exec(callback: CallbackType<QueryResponse<Data>, any>): void;
  sort(order: SortOrder): Query<Data, Key>;
}

export interface Scan<Data, Key> extends BasicOperators<Scan<Data, Key>> {
  exec(): Promise<ScanResponse<Data>>;
  exec(callback: CallbackType<ScanResponse<Data>, any>): void;
  parallel(value: number): Scan<Data, Key>;
}

// Transaction
export type GetTransactionInput = { Get: DynamoDB.GetItemInput };
export type CreateTransactionInput = { Put: DynamoDB.PutItemInput };
export type DeleteTransactionInput = { Delete: DynamoDB.DeleteItemInput };
export type UpdateTransactionInput = { Update: DynamoDB.UpdateItemInput };
export type ConditionTransactionInput = {
  ConditionCheck: DynamoDB.ConditionCheck;
};

export type GetTransactionResult = Promise<GetTransactionInput>;
export type CreateTransactionResult = Promise<CreateTransactionInput>;
export type DeleteTransactionResult = Promise<DeleteTransactionInput>;
export type UpdateTransactionResult = Promise<UpdateTransactionInput>;
export type ConditionTransactionResult = Promise<ConditionTransactionInput>;

export interface GetTransaction<Key> {
  (key: Key): GetTransactionResult;
  (key: Key, settings?: ModelGetSettings): GetTransactionResult;
  (
    key: Key,
    settings: ModelGetSettings & { return: 'document' },
  ): GetTransactionResult;
  (
    key: Key,
    settings: ModelGetSettings & { return: 'request' },
  ): GetTransactionResult;
}
export interface CreateTransaction<Data> {
  (document: Partial<Data>): CreateTransactionResult;
  (
    document: Partial<Data>,
    settings: DocumentSaveSettings & { return: 'request' },
  ): CreateTransactionResult;
  (
    document: Partial<Data>,
    settings: DocumentSaveSettings & { return: 'document' },
  ): CreateTransactionResult;
  (
    document: Partial<Data>,
    settings?: DocumentSaveSettings,
  ): CreateTransactionResult;
}
export interface DeleteTransaction<Key> {
  (key: Key): DeleteTransactionResult;
  (
    key: Key,
    settings: ModelDeleteSettings & { return: 'request' },
  ): DeleteTransactionResult;
  (
    key: Key,
    settings: ModelDeleteSettings & { return: null },
  ): DeleteTransactionResult;
  (key: Key, settings?: ModelDeleteSettings): DeleteTransactionResult;
}
export interface UpdateTransaction<Key, Data> {
  (obj: Data): UpdateTransactionResult;
  (keyObj: Key, updateObj: UpdatePartial<Data>): UpdateTransactionResult;
  (
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings & { return: 'document' },
  ): UpdateTransactionResult;
  (
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings & { return: 'request' },
  ): UpdateTransactionResult;
  (
    keyObj: Key,
    updateObj?: UpdatePartial<Data>,
    settings?: ModelUpdateSettings,
  ): UpdateTransactionResult;
}
export interface ConditionTransaction<Key> {
  (key: Key, condition: Condition): ConditionTransactionResult;
}

type TransactionType<Data, Key> = {
  get: GetTransaction<Data>;
  create: CreateTransaction<Data>;
  delete: DeleteTransaction<Key>;
  update: UpdateTransaction<Key, Data>;
  condition: ConditionTransaction<Key>;
};
