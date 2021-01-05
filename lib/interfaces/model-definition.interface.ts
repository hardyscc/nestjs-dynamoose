import { ModelOptionsOptional } from 'dynamoose/dist/Model';
import { Schema, SchemaDefinition } from 'dynamoose/dist/Schema';
import { SerializerOptions } from 'dynamoose/dist/Serializer';

export type ModelDefinition = {
  name: string;
  schema: Schema | SchemaDefinition | (Schema | SchemaDefinition)[];
  options?: ModelOptionsOptional;
  serializers?: { [key: string]: SerializerOptions };
};
