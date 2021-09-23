import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { ItemDescriptor } from '../../repositories';
import { CompoundMap } from './CompoundMap';
import { CompoundMapperConfig } from './CompoundMapperConfig';

export interface CompoundMapper<T> extends ItemDescriptor<T> {
  partitionKey: string;
  sortKey: string;
  config: CompoundMapperConfig<T>;
  create(item: T | AttributeMap): CompoundMap<T>;
  toPartitionValue(id: string): string;
  toSortKeyValue(id: string): string;
}
