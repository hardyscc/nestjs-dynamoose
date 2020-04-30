import { ModelOptionsOptional } from 'dynamoose/dist/Model';
import { Schema } from 'dynamoose/dist/Schema';

export type ModelDefinition = {
  name: string;
  schema: Schema;
  options?: ModelOptionsOptional;
};
