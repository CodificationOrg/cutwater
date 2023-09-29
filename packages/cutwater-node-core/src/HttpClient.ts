import { Logger, LoggerFactory } from '@codification/cutwater-logging';
import { System } from '@codification/cutwater-nullable';
import { IncomingMessage } from 'http';
import * as needle from 'needle';
import { BodyData, NeedleResponse } from 'needle';
import { dirname } from 'path';
import { HttpUtils } from './HttpUtils';

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
  fetchData(url: string): Promise<DataResponse | undefined>;
  post(
    url: string,
    body: BodyData,
    json: boolean
  ): Promise<DataResponse | undefined>;
}

export class HttpClient {
  private readonly LOG: Logger;
  private readonly client: InternalClient;

  public static readonly TEXT_ENCODING = 'utf-8';
  public static readonly HTML_CONTENT_TYPE = 'text/html';
  public static readonly JSON_CONTENT_TYPE = 'application/json';

  public static readonly SUCCESS_STATUS_CODE = 200;

  public static create(): HttpClient {
    return new HttpClient();
  }

  public static createNull(
    response?: DataResponse,
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
    return this.client?.fetchData(url);
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
    return this.client.post(url, body, json);
  }
}

class NullInternalClient implements InternalClient {
  public constructor(private readonly response?: DataResponse) {}

  public async fetchData(): Promise<DataResponse | undefined> {
    return this.response;
  }

  public async post(): Promise<DataResponse | undefined> {
    return this.response;
  }
}

class NeedleInteralClient implements InternalClient {
  private static readonly CONTENT_LENGTH_HEADER = 'content-length';
  private static readonly CONTENT_TYPE_HEADER = 'content-type';
  private static readonly NOT_FOUND_STATUS_CODE = 404;
  private static readonly GET_METHOD = 'get';
  private static readonly POST_METHOD = 'post';

  public constructor(private readonly log: Logger) {}

  private toHttpResponse(response: IncomingMessage): HttpResponse {
    const rval: HttpResponse = {
      statusCode: response.statusCode || 0,
      contentLength: -1,
      contentType: '',
    };
    if (response.headers) {
      rval.contentLength = +(
        response.headers[NeedleInteralClient.CONTENT_LENGTH_HEADER] || '-1'
      );
      rval.contentType =
        response.headers[NeedleInteralClient.CONTENT_TYPE_HEADER] || '';
    }
    return rval;
  }

  public async fetchData(url: string): Promise<DataResponse | undefined> {
    const response: NeedleResponse = await needle(
      NeedleInteralClient.GET_METHOD,
      url,
      {
        responseType: 'buffer',
        throwHttpErrors: false,
      }
    );
    if (HttpUtils.isResponseOk(response)) {
      return {
        data: response.raw,
        ...this.toHttpResponse(response),
      };
    } else if (
      response.statusCode === NeedleInteralClient.NOT_FOUND_STATUS_CODE
    ) {
      return undefined;
    } else {
      this.log.error(
        `Url[${url}] returned error status code [${response.statusCode}]: \n`,
        response.statusMessage,
        response.body
      );
      throw new Error('Data could not be fetched from url.');
    }
  }

  public async post(
    url: string,
    body: BodyData,
    json = true
  ): Promise<DataResponse | undefined> {
    const response: NeedleResponse = await needle(
      NeedleInteralClient.POST_METHOD,
      url,
      body,
      { json }
    );
    if (HttpUtils.isResponseOk(response)) {
      return {
        data: response.raw,
        ...this.toHttpResponse(response),
      };
    } else if (
      response.statusCode === NeedleInteralClient.NOT_FOUND_STATUS_CODE
    ) {
      return undefined;
    } else {
      this.log.error(
        `Url[${url}] returned error status code [${response.statusCode}]: \n`,
        response.statusMessage,
        response.body
      );
      throw new Error('Error during post to url.');
    }
  }
}
