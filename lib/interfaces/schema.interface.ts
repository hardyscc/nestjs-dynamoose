export interface Schema {
  (schema: SchemaAttributes, options?: SchemaOptions);
  method(name: string, fn: any): any;
  parseDynamo(model: any, dynamoObj: any): any;
  static(name: string, fn: any): any;
  toDynamo(model: any): any;
  virtual(name: string, options: any): any;
  virtualpath(name: string): any;
}

export interface RawSchemaAttributeDefinition<Constructor, Type> {
  [key: string]:
    | SchemaAttributeDefinition<Constructor, Type>
    | RawSchemaAttributeDefinition<Constructor, Type>;
}
export interface SchemaAttributeDefinition<Constructor, Type> {
  type: Constructor;
  validate?: (v: Type) => boolean | Promise<boolean>;
  hashKey?: boolean;
  rangeKey?: boolean;
  required?: boolean;
  get?: () => Type;
  set?: (v: Type) => void;
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  /**
   * Indicating Secondary Index.
   * 'true' is means local, project all
   */
  index?: boolean | IndexDefinition | IndexDefinition[];
  default?: (() => Type) | Type;
}
export interface SchemaOptions {
  throughput?: boolean | { read: number; write: number } | 'ON_DEMAND';
  useNativeBooleans?: boolean;
  useDocumentTypes?: boolean;
  timestamps?: boolean | { createdAt: string; updatedAt: string };
  expires?:
    | number
    | { ttl: number; attribute: string; returnExpiredItems: boolean };
  saveUnknown?: boolean;

  // @todo more strong type definition
  attributeToDynamo?: (
    name: string,
    json: any,
    model: any,
    defaultFormatter: any,
  ) => any;
  attributeFromDynamo?: (name: string, json: any, fallback: any) => any;
}

export interface SchemaAttributes {
  [key: string]:
    | SchemaAttributeDefinition<NumberConstructor, number>
    | SchemaAttributeDefinition<[NumberConstructor], number[]>
    | SchemaAttributeDefinition<DateConstructor, Date>
    | SchemaAttributeDefinition<StringConstructor, string>
    | SchemaAttributeDefinition<[StringConstructor], string[]>
    | SchemaAttributeDefinition<ObjectConstructor, object>
    | SchemaAttributeDefinition<ArrayConstructor, Array<any>>
    | SchemaAttributeDefinition<any, any>
    | RawSchemaAttributeDefinition<any, any>
    | NumberConstructor
    | [NumberConstructor]
    | DateConstructor
    | StringConstructor
    | [StringConstructor]
    | ObjectConstructor
    | ArrayConstructor;
}

/**
 * Index
 */
interface IndexDefinition {
  name?: string;
  global?: boolean;
  rangeKey?: string;
  project?: boolean | string[];
  throughput?: number | { read: number; write: number };
}
