import { LoggerFactory } from '@codification/cutwater-logging';
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

export class HttpService {
  private readonly LOG = LoggerFactory.getLogger();

  public constructor(private readonly system: System = System.create()) {}

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
    if (data && data.contentType.toLowerCase().indexOf('text/html') !== -1) {
      return {
        body: data.data.toString('utf-8'),
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
      data.contentType.toLowerCase().indexOf('application/json') !== -1
    ) {
      return {
        object: JSON.parse(data.data.toString('utf-8')),
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
    const response: NeedleResponse = await needle('get', url, {
      responseType: 'buffer',
      throwHttpErrors: false,
    });
    if (HttpUtils.isResponseOk(response)) {
      return {
        data: response.raw,
        ...this.toHttpResponse(response),
      };
    } else if (response.statusCode === 404) {
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
    if (!!response && response.statusCode === 200) {
      this.system.toFileReference(path).write(response.data);
    } else if (response) {
      throw new Error(
        `Received error code during download[${url}]: ${response.statusCode}`
      );
    } else {
      throw new Error(`Failed to receive response: ${url}`);
    }
  }

  public async postFormForObject<T>(
    url: string,
    body: BodyData
  ): Promise<ObjectResponse<T> | undefined> {
    return await this.postForObject<T>(url, body, false);
  }

  public async postForObject<T>(
    url: string,
    body: BodyData,
    json = true
  ): Promise<ObjectResponse<T> | undefined> {
    const data: DataResponse | undefined = await this.post(url, body, json);
    if (
      data &&
      data.contentType.toLowerCase().indexOf('application/json') !== -1
    ) {
      return {
        object: JSON.parse(data.data.toString('utf-8')),
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
    const response: NeedleResponse = await needle('post', url, body, { json });
    if (HttpUtils.isResponseOk(response)) {
      return {
        data: response.raw,
        ...this.toHttpResponse(response),
      };
    } else if (response.statusCode === 404) {
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

  private toHttpResponse(response: IncomingMessage): HttpResponse {
    const rval: HttpResponse = {
      statusCode: response.statusCode || 0,
      contentLength: -1,
      contentType: '',
    };
    if (response.headers) {
      rval.contentLength = +(response.headers['content-length'] || '-1');
      rval.contentType = response.headers['content-type'] || '';
    }
    return rval;
  }
}
