import { Inject } from '@nestjs/common';
import { getModelToken } from './dynamoose.utils';

export const InjectModel = (model: string) => Inject(getModelToken(model));
