import { AWSError } from 'aws-sdk';
import {
  Condition,
  ConditionFunction,
  ConditionInitalizer,
} from 'dynamoose/dist/Condition';

export declare type CallbackType<R, E> = (
  error?: E | null,
  response?: R,
) => void;

export interface DocumentRetrieverResponse<Data, Key> extends Array<Data> {
  lastKey?: Key;
  count: number;
}
export interface ScanResponse<Data, Key>
  extends DocumentRetrieverResponse<Data, Key> {
  scannedCount: number;
  timesScanned: number;
}
export interface QueryResponse<Data, Key>
  extends DocumentRetrieverResponse<Data, Key> {
  queriedCount: number;
  timesQueried: number;
}

export interface UnprocessedItems<T> {
  unprocessedItems: T[];
}

export enum SortOrder {
  ascending = 'ascending',
  descending = 'descending',
}

export interface ModelUpdateSettings {
  condition?: Condition;
}

export type UpdatePartial<T> =
  | Partial<T>
  | { $SET: Partial<T> }
  | { $ADD: Partial<T> }
  | { $REMOVE: Partial<T> };

export interface Model<Data, Key> {
  query(condition?: ConditionInitalizer): QueryInterface<Data, Key>;
  scan(condition?: ConditionInitalizer): ScanInterface<Data, Key>;

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
    settings: ModelUpdateSettings,
  ): Promise<Data>;
  update(
    keyObj: Key,
    updateObj: UpdatePartial<Data>,
    settings: ModelUpdateSettings,
    callback: CallbackType<Data, AWSError>,
  ): void;

  create(document: Data): Promise<Data>;
  create(document: Data, callback: CallbackType<Data, Error>): void;

  delete(key: Key): Promise<void>;
  delete(key: Key, callback: CallbackType<void, AWSError>): void;

  get(key: Key): Promise<Data>;
  get(key: Key, callback: CallbackType<Data, AWSError>): void;

  batchPut(documents: Data[]): Promise<UnprocessedItems<Data>>;
  batchPut(
    documents: Data[],
    callback: CallbackType<UnprocessedItems<Data>, AWSError>,
  ): void;

  batchGet(keys: Key[]): Promise<Data[]>;
  batchGet(keys: Key[], callback: CallbackType<Data[], AWSError>): void;

  batchDelete(keys: Key[]): Promise<UnprocessedItems<Key>>;
  batchDelete(
    keys: Key[],
    callback: CallbackType<UnprocessedItems<Key>, AWSError>,
  ): void;
}

export interface QueryInterface<Data, Key> {
  exec(): Promise<QueryResponse<Data, Key>>;
  exec(callback: CallbackType<QueryResponse<Data, Key>, AWSError>): void;

  getRequest(): Promise<any>;
  all(delay?: number, max?: number): QueryInterface<Data, Key>;
  limit(value: number): QueryInterface<Data, Key>;
  startAt(value: Key): QueryInterface<Data, Key>;
  attributes(value: string[]): QueryInterface<Data, Key>;
  count(): QueryInterface<Data, Key>;
  consistent(): QueryInterface<Data, Key>;
  using(value: string): QueryInterface<Data, Key>;
  and(): QueryInterface<Data, Key>;
  or(): QueryInterface<Data, Key>;
  not(): QueryInterface<Data, Key>;
  parenthesis(value: Condition | ConditionFunction): QueryInterface<Data, Key>;
  group(value: Condition | ConditionFunction): QueryInterface<Data, Key>;
  where(key: string): QueryInterface<Data, Key>;
  filter(key: string): QueryInterface<Data, Key>;
  attribute(key: string): QueryInterface<Data, Key>;
  eq(value: any): QueryInterface<Data, Key>;
  lt(value: any): QueryInterface<Data, Key>;
  le(value: any): QueryInterface<Data, Key>;
  gt(value: any): QueryInterface<Data, Key>;
  ge(value: any): QueryInterface<Data, Key>;
  beginsWith(value: any): QueryInterface<Data, Key>;
  contains(value: any): QueryInterface<Data, Key>;
  exists(value: any): QueryInterface<Data, Key>;
  in(value: any): QueryInterface<Data, Key>;
  between(...values: any[]): QueryInterface<Data, Key>;
  sort(order: SortOrder): QueryInterface<Data, Key>;
}

export interface ScanInterface<Data, Key> {
  exec(): Promise<ScanResponse<Data, Key>>;
  exec(callback: CallbackType<ScanResponse<Data, Key>, AWSError>): void;
  parallel(value: number): ScanInterface<Data, Key>;

  getRequest(): Promise<any>;
  all(delay?: number, max?: number): ScanInterface<Data, Key>;
  limit(value: number): ScanInterface<Data, Key>;
  startAt(value: Key): ScanInterface<Data, Key>;
  attributes(value: string[]): ScanInterface<Data, Key>;
  count(): ScanInterface<Data, Key>;
  consistent(): ScanInterface<Data, Key>;
  using(value: string): ScanInterface<Data, Key>;
  and(): ScanInterface<Data, Key>;
  or(): ScanInterface<Data, Key>;
  not(): ScanInterface<Data, Key>;
  parenthesis(value: Condition | ConditionFunction): ScanInterface<Data, Key>;
  group(value: Condition | ConditionFunction): ScanInterface<Data, Key>;
  where(key: string): ScanInterface<Data, Key>;
  filter(key: string): ScanInterface<Data, Key>;
  attribute(key: string): ScanInterface<Data, Key>;
  eq(value: any): ScanInterface<Data, Key>;
  lt(value: any): ScanInterface<Data, Key>;
  le(value: any): ScanInterface<Data, Key>;
  gt(value: any): ScanInterface<Data, Key>;
  ge(value: any): ScanInterface<Data, Key>;
  beginsWith(value: any): ScanInterface<Data, Key>;
  contains(value: any): ScanInterface<Data, Key>;
  exists(value: any): ScanInterface<Data, Key>;
  in(value: any): ScanInterface<Data, Key>;
  between(...values: any[]): ScanInterface<Data, Key>;
  sort(order: SortOrder): ScanInterface<Data, Key>;
}
