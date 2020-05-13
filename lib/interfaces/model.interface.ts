import { AWSError, DynamoDB } from 'aws-sdk';
import {
  Condition,
  ConditionFunction,
  ConditionInitalizer,
} from 'dynamoose/dist/Condition';

export declare type ObjectType = {
  [key: string]: any;
};

export declare type CallbackType<R, E> = (
  error?: E | null,
  response?: R,
) => void;

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

export declare enum SortOrder {
  ascending = 'ascending',
  descending = 'descending',
}

export interface ModelGetSettings {
  return: 'document' | 'request';
}
export interface ModelDeleteSettings {
  return: null | 'request';
}
export interface ModelBatchPutSettings {
  return: 'response' | 'request';
}
export interface ModelUpdateSettings {
  return: 'document' | 'request';
  condition?: Condition;
}
export interface ModelBatchGetSettings {
  return: 'documents' | 'request';
}
export interface ModelBatchDeleteSettings {
  return: 'response' | 'request';
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

export interface Model<Data, Key> {
  query(condition?: ConditionInitalizer): Query<Data, Key>;

  scan(condition?: ConditionInitalizer): Scan<Data, Key>;

  batchGet(keys: Key[]): Promise<Data[]>;
  batchGet(keys: Key[], callback: CallbackType<Data[], AWSError>): void;
  batchGet(
    keys: Key[],
    settings: ModelBatchGetSettings & {
      return: 'documents';
    },
  ): Promise<Data[]>;
  batchGet(
    keys: Key[],
    settings: ModelBatchGetSettings & {
      return: 'documents';
    },
    callback: CallbackType<Data[], AWSError>,
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
    callback: CallbackType<DynamoDB.BatchGetItemInput, AWSError>,
  ): void;

  batchPut(documents: Data[]): Promise<UnprocessedItems<Data>>;
  batchPut(
    documents: Data[],
    callback: CallbackType<UnprocessedItems<Data>, AWSError>,
  ): void;
  batchPut(
    documents: Data[],
    settings: ModelBatchPutSettings & {
      return: 'request';
    },
  ): Promise<DynamoDB.BatchWriteItemInput>;
  batchPut(
    documents: Data[],
    settings: ModelBatchPutSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.BatchWriteItemInput, AWSError>,
  ): void;
  batchPut(
    documents: Data[],
    settings: ModelBatchPutSettings & {
      return: 'response';
    },
  ): Promise<UnprocessedItems<Data>>;
  batchPut(
    documents: Data[],
    settings: ModelBatchPutSettings & {
      return: 'response';
    },
    callback: CallbackType<UnprocessedItems<Data>, AWSError>,
  ): void;

  batchDelete(keys: Key[]): Promise<UnprocessedItems<Key>>;
  batchDelete(
    keys: Key[],
    callback: CallbackType<UnprocessedItems<Key>, AWSError>,
  ): void;
  batchDelete(
    keys: Key[],
    settings: ModelBatchDeleteSettings & {
      return: 'response';
    },
  ): Promise<{
    unprocessedItems: ObjectType[];
  }>;
  batchDelete(
    keys: Key[],
    settings: ModelBatchDeleteSettings & {
      return: 'response';
    },
    callback: CallbackType<UnprocessedItems<Key>, AWSError>,
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
    callback: CallbackType<DynamoDB.BatchWriteItemInput, AWSError>,
  ): void;

  update(obj: Data): Promise<Data>;
  update(obj: Data, callback: CallbackType<Data, AWSError>): void;
  update(keyObj: Key, updateObj: UpdatePartial<Data>): Promise<Data>;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    callback: CallbackType<Data, AWSError>,
  ): void;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings & {
      return: 'document';
    },
  ): Promise<Data>;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings & {
      return: 'document';
    },
    callback: CallbackType<Data, AWSError>,
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
    callback: CallbackType<DynamoDB.UpdateItemInput, AWSError>,
  ): void;

  create(document: Data): Promise<Data>;
  create(document: Data, callback: CallbackType<Data, AWSError>): void;
  create(
    document: Data,
    settings: DocumentSaveSettings & {
      return: 'request';
    },
  ): Promise<DynamoDB.PutItemInput>;
  create(
    document: Data,
    settings: DocumentSaveSettings & {
      return: 'request';
    },
    callback: CallbackType<DynamoDB.PutItemInput, AWSError>,
  ): void;
  create(
    document: Data,
    settings: DocumentSaveSettings & {
      return: 'document';
    },
  ): Promise<Data>;
  create(
    document: Data,
    settings: DocumentSaveSettings & {
      return: 'document';
    },
    callback: CallbackType<Data, AWSError>,
  ): void;

  delete(key: Key): Promise<void>;
  delete(key: Key, callback: CallbackType<void, AWSError>): void;
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
    callback: CallbackType<DynamoDB.DeleteItemInput, AWSError>,
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
    callback: CallbackType<void, AWSError>,
  ): void;

  get(key: Key): Promise<Data>;
  get(key: Key, callback: CallbackType<Data, AWSError>): void;
  get(
    key: Key,
    settings: ModelGetSettings & {
      return: 'document';
    },
  ): Promise<Data>;
  get(
    key: Key,
    settings: ModelGetSettings & {
      return: 'document';
    },
    callback: CallbackType<Data, AWSError>,
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
    callback: CallbackType<DynamoDB.GetItemInput, AWSError>,
  ): void;
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
  exists(value: any): T;
  in(value: any): T;
  between(...values: any[]): T;
}

export interface Query<Data, Key> extends BasicOperators<Query<Data, Key>> {
  exec(): Promise<QueryResponse<Data>>;
  exec(callback: CallbackType<QueryResponse<Data>, AWSError>): void;
  sort(order: SortOrder): Query<Data, Key>;
}

export interface Scan<Data, Key> extends BasicOperators<Scan<Data, Key>> {
  exec(): Promise<ScanResponse<Data>>;
  exec(callback: CallbackType<ScanResponse<Data>, AWSError>): void;
  parallel(value: number): Scan<Data, Key>;
}
