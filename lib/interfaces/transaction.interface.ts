import * as dynamoose from 'dynamoose';
import { TransactionSettings } from 'dynamoose/dist/Transaction';
import {
  CallbackType,
  ConditionTransactionInput,
  CreateTransactionInput,
  DeleteTransactionInput,
  GetTransactionInput,
  UpdateTransactionInput,
} from './model.interface';

export type Transaction =
  | GetTransactionInput
  | CreateTransactionInput
  | DeleteTransactionInput
  | UpdateTransactionInput
  | ConditionTransactionInput;

export type Transactions = (Transaction | Promise<Transaction>)[];

export abstract class TransactionSupport {
  transaction(
    transactions: Transactions,
    settings?: TransactionSettings,
    callback?: CallbackType<any, any>,
  ): any {
    return dynamoose.transaction(
      transactions,
      settings as any,
      callback as any,
    );
  }
}
