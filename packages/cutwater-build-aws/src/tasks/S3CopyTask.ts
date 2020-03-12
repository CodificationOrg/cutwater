import { AwsCliTask } from './AwsCliTask';

export interface S3CopyParameters {
  from: string;
  to: string;
  dryrun?: boolean;
  quiet: boolean;
  include?: string;
  exclude?: string;
  acl?: string;
  followSymlinks?: boolean;
  noFollowSymlinks?: boolean;
  noGuessMimeType?: boolean;
  storageClass?:
    | 'STANDARD'
    | 'REDUCED_REDUNDANCY'
    | 'STANDARD_IA'
    | 'ONEZONE_IA'
    | 'INTELLIGENT_TIERING'
    | 'GLACIER'
    | 'DEEP_ARCHIVE';
  grants?: string;
  websiteRedirect?: string;
  contentType?: string;
  cacheControl?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  contentLanguage?: string;
  expires?: string;
  sourceRegion?: string;
  onlyShowErrors?: boolean;
  noProgress?: boolean;
  pageSize?: number;
  ignoreGlacierWarnings?: boolean;
  forceGlacierTransfer?: boolean;
  requestPayer?: string;
  metadata?: { [key: string]: string };
  metadataDirective?: string;
  expectedSize?: string;
  recursive?: boolean;
}

export class S3CopyTask extends AwsCliTask<S3CopyParameters> {
  public constructor() {
    super('s3-copy', 's3', 'cp', ['from', 'to']);
  }

  protected preparedCommand(): string {
    return `${super.preparedCommand()}${this.config.parameters?.from} ${this.config.parameters?.to} `;
  }
}
