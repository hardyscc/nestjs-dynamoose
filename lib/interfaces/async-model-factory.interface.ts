import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ModelDefinition } from './model-definition.interface';

export interface AsyncModelFactory
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<ModelDefinition, 'name' | 'options' | 'serializers' | 'provide'> {
  useFactory: (
    ...args: any[]
  ) => ModelDefinition['schema'] | Promise<ModelDefinition['schema']>;
  inject?: any[];
}
