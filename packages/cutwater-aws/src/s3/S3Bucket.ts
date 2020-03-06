import { S3 } from 'aws-sdk';
import { GetObjectOutput, GetObjectRequest, PutObjectOutput, PutObjectRequest } from 'aws-sdk/clients/s3';
import * as mime from 'mime';
import { Readable } from 'stream';

/**
 * @beta
 */
export class S3Bucket {
  public static toMimeType(key: string): string {
    return mime.getType(key) || '';
  }

  private bucketName: string;
  private s3Client: S3;

  public constructor(bucketName: string, client?: S3) {
    this.bucketName = bucketName;
    this.s3Client = client ? client : new S3();
  }

  public setBucketName(name: string): void {
    if (!name) {
      throw new Error('Bucket name is required.');
    }
    this.bucketName = name;
  }

  public async exists(fileName: string): Promise<boolean> {
    let rval: boolean = false;
    try {
      await this.s3Client.headObject({ Bucket: this.bucketName, Key: fileName }).promise();
      rval = true;
    } catch (err) {
      if (err.code !== 'NotFound') {
        throw err;
      }
    }
    return rval;
  }

  public async remove(fileName: string): Promise<void> {
    await this.s3Client.deleteObject(this.toBaseObjectRequest(fileName)).promise();
  }

  public async loadBuffer(fileName: string): Promise<Buffer> {
    const output = await this.load(fileName);
    if (!Buffer.isBuffer(output.Body)) {
      throw new Error(`Object is ${typeof output.Body},not a Buffer.`);
    }
    return output.Body;
  }

  public async load(fileName: string): Promise<GetObjectOutput> {
    return await this.s3Client.getObject(this.toBaseObjectRequest(fileName)).promise();
  }

  public async store(
    fileName: string,
    content: string | Buffer | Readable,
    mimeType?: string,
  ): Promise<PutObjectOutput> {
    return await this.s3Client.putObject(this.toPutObjectRequest(fileName, content, mimeType)).promise();
  }

  private toPutObjectRequest(key: string, content: string | Buffer | Readable, mimeType?: string): PutObjectRequest {
    const rval: PutObjectRequest = {
      ...this.toBaseObjectRequest(key),
      Body: content,
      ContentType: mimeType ? mimeType : S3Bucket.toMimeType(key),
    };
    return rval;
  }

  private toBaseObjectRequest(key: string): GetObjectRequest {
    return {
      Bucket: this.bucketName,
      Key: key,
    };
  }
}
