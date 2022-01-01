import { S3 } from 'aws-sdk';

export interface CompoundItemS3RepositoryConfig<T> {
  readonly s3?: S3;
  readonly itemType: string;
  readonly bucketName: string;
  readonly idProperty: string;
  deserialize?: (serialized: string) => T;
  serialize?: (item: T) => string;
}
