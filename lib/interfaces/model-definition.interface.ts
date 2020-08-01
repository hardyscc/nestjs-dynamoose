import { ModelOptionsOptional } from 'dynamoose/dist/Model';
import { Schema, SchemaDefinition } from 'dynamoose/dist/Schema';

export type ModelDefinition = {
  name: string;
  schema: Schema | SchemaDefinition | (Schema | SchemaDefinition)[];
  options?: ModelOptionsOptional;
};
