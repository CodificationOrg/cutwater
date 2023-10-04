import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { System } from '@codification/cutwater-nullable';
import { IncomingMessage } from 'http';
import * as needle from 'needle';
import { BodyData } from 'needle';
import { dirname } from 'path';
import { HttpUtils } from './HttpUtils';

export interface ExtendedIncomingMessage extends IncomingMessage {
  raw?: Buffer;
  body?: unknown;
}

export interface HttpResponse {
  statusCode: number;
  contentLength: number;
  contentType: string;
}

export interface HtmlResponse extends HttpResponse {
  body: string;
}

export interface DataResponse extends HttpResponse {
  data: Buffer;
}

export interface ObjectResponse<T> extends HttpResponse {
  object: T;
}

interface InternalClient {
  doGet(url: string): Promise<ExtendedIncomingMessage>;
  doPost(
    url: string,
    body: BodyData,
    json: boolean
  ): Promise<ExtendedIncomingMessage>;
}

export class HttpClient {
  private readonly LOG: Logger;
  private readonly client: InternalClient;

  private static readonly CONTENT_LENGTH_HEADER = 'content-length';
  private static readonly CONTENT_TYPE_HEADER = 'content-type';

  private static readonly SUCCESS_STATUS_CODE = 200;
  private static readonly NOT_FOUND_STATUS_CODE = 404;

  public static readonly TEXT_ENCODING = 'utf-8';

  public static readonly HTML_CONTENT_TYPE = 'text/html';
  public static readonly JSON_CONTENT_TYPE = 'application/json';

  public static create(): HttpClient {
    return new HttpClient();
  }

  public static createNull(
    response: Partial<ExtendedIncomingMessage> = {
      statusCode: 404,
    },
    system: System = System.createNull()
  ): HttpClient {
    return new HttpClient(new NullInternalClient(response), system);
  }

  private constructor(
    client?: InternalClient,
    private readonly system: System = System.create()
  ) {
    this.LOG = LoggerFactory.getLogger();
    this.client = client || new NeedleInteralClient(this.LOG);
  }

  public async exists(url: string): Promise<boolean> {
    try {
      const response = await this.fetchData(url);
      return response !== undefined;
    } catch (err) {
      return false;
    }
  }

  private toHttpResponse(response: IncomingMessage): HttpResponse {
    const rval: HttpResponse = {
      statusCode: response.statusCode || 0,
      contentLength: -1,
      contentType: '',
    };
    if (response.headers) {
      rval.contentLength = +(
        response.headers[HttpClient.CONTENT_LENGTH_HEADER] || '-1'
      );
      rval.contentType = response.headers[HttpClient.CONTENT_TYPE_HEADER] || '';
    }
    return rval;
  }

  public async fetchHtml(url: string): Promise<HtmlResponse | undefined> {
    const data: DataResponse | undefined = await this.fetchData(url);
    if (
      data &&
      data.contentType.toLowerCase().indexOf(HttpClient.HTML_CONTENT_TYPE) !==
        -1
    ) {
      return {
        body: data.data.toString(HttpClient.TEXT_ENCODING),
        ...data,
      };
    } else if (data) {
      this.LOG.warn(
        `Url[${url}] returned non-html content type: ${data.contentType}`
      );
      throw new Error('Returned content was not html.');
    } else {
      return undefined;
    }
  }

  public async fetchObject<T>(
    url: string
  ): Promise<ObjectResponse<T> | undefined> {
    const data: DataResponse | undefined = await this.fetchData(url);
    if (
      data &&
      data.contentType.toLowerCase().indexOf(HttpClient.JSON_CONTENT_TYPE) !==
        -1
    ) {
      return {
        object: JSON.parse(data.data.toString(HttpClient.TEXT_ENCODING)),
        ...data,
      };
    } else if (data) {
      this.LOG.warn(
        `Url[${url}] returned non-json content type: ${data.contentType}`
      );
      throw new Error('Returned content was not valid json.');
    } else {
      return undefined;
    }
  }

  public async fetchData(url: string): Promise<DataResponse | undefined> {
    const response: ExtendedIncomingMessage = await this.client.doGet(url);
    if (HttpUtils.isResponseOk(response) && response.raw) {
      return {
        data: response.raw,
        ...this.toHttpResponse(response),
      };
    } else if (response.statusCode === HttpClient.NOT_FOUND_STATUS_CODE) {
      return undefined;
    } else {
      this.LOG.error(
        `Url[${url}] returned error status code [${response.statusCode}]: \n`,
        response.statusMessage,
        response.body
      );
      throw new Error('Data could not be fetched from url.');
    }
  }

  public async downloadToFile(url: string, path: string): Promise<void> {
    this.system.mkdir(dirname(path), true);
    const response: DataResponse | undefined = await this.fetchData(url);
    if (!!response && response.statusCode === HttpClient.SUCCESS_STATUS_CODE) {
      this.system.toFileReference(path).write(response.data);
    } else if (response) {
      throw new Error(
        `Received error code during download[${url}]: ${response.statusCode}`
      );
    } else {
      throw new Error(`Failed to receive response: ${url}`);
    }
  }

  public async postForObject<T>(
    url: string,
    body: BodyData
  ): Promise<ObjectResponse<T> | undefined> {
    const data: DataResponse | undefined = await this.post(url, body, true);
    if (
      data &&
      data.contentType.toLowerCase().indexOf(HttpClient.JSON_CONTENT_TYPE) !==
        -1
    ) {
      return {
        object: JSON.parse(data.data.toString(HttpClient.TEXT_ENCODING)),
        ...data,
      };
    } else if (data) {
      this.LOG.warn(
        `Url[${url}] returned non-json content type: ${data.contentType}`
      );
      throw new Error('Returned content was not valid json.');
    } else {
      return undefined;
    }
  }

  public async post(
    url: string,
    body: BodyData,
    json = true
  ): Promise<DataResponse | undefined> {
    const response: ExtendedIncomingMessage = await this.client.doPost(
      url,
      body,
      json
    );
    if (HttpUtils.isResponseOk(response) && response.raw) {
      return {
        data: response.raw,
        ...this.toHttpResponse(response),
      };
    } else if (response.statusCode === HttpClient.NOT_FOUND_STATUS_CODE) {
      return undefined;
    } else {
      this.LOG.error(
        `Url[${url}] returned error status code [${response.statusCode}]: \n`,
        response.statusMessage,
        response.body
      );
      throw new Error('Error during post to url.');
    }
  }
}

class NullInternalClient implements InternalClient {
  public constructor(
    private readonly response: Partial<ExtendedIncomingMessage>
  ) {}

  public async doGet(): Promise<ExtendedIncomingMessage> {
    return this.response as ExtendedIncomingMessage;
  }

  public async doPost(): Promise<ExtendedIncomingMessage> {
    return this.response as ExtendedIncomingMessage;
  }
}

class NeedleInteralClient implements InternalClient {
  private static readonly GET_METHOD = 'get';
  private static readonly POST_METHOD = 'post';

  public constructor(private readonly log: Logger) {}

  public async doGet(url: string): Promise<ExtendedIncomingMessage> {
    return await needle(NeedleInteralClient.GET_METHOD, url, {
      responseType: 'buffer',
      throwHttpErrors: false,
    });
  }

  public async doPost(
    url: string,
    body: BodyData,
    json = true
  ): Promise<ExtendedIncomingMessage> {
    return await needle(NeedleInteralClient.POST_METHOD, url, body, { json });
  }
}
