import { Inject } from '@nestjs/common';
import { getModelToken, getTableToken } from './dynamoose.utils';

export const InjectModel = (model: string) => Inject(getModelToken(model));
export const InjectTable = (table: string) => Inject(getTableToken(table));
