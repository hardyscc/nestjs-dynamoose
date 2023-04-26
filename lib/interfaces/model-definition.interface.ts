import { ModelTableOptions } from 'dynamoose/dist/Model';
import { Schema, SchemaDefinition } from 'dynamoose/dist/Schema';
import { SerializerOptions } from 'dynamoose/dist/Serializer';

export type ModelDefinition = {
  name: string;
  schema: Schema | SchemaDefinition | (Schema | SchemaDefinition)[];
  options?: ModelTableOptions;
  serializers?: { [key: string]: SerializerOptions };
};
