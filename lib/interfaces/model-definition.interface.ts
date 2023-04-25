import { Schema, SchemaDefinition } from 'dynamoose/dist/Schema';
import { SerializerOptions } from 'dynamoose/dist/Serializer';
import { ModelTableOptions } from 'dynamoose/dist/Model'

export type ModelDefinition = {
  name: string;
  schema: Schema | SchemaDefinition | (Schema | SchemaDefinition)[];
  options?: ModelTableOptions;
  serializers?: { [key: string]: SerializerOptions };
};
