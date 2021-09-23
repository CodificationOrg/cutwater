import { DynamoDB } from 'aws-sdk';
import { CompoundMapper } from './CompoundMapper';

export interface CompoundKeyItemRepositoryConfig<T> {
  db?: DynamoDB;
  tableName: string;
  mapper: CompoundMapper<T>;
}
