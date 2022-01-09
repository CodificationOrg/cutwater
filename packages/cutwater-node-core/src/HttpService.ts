import { LoggerFactory } from '@codification/cutwater-logging';
import got, { OptionsOfBufferResponseBody } from 'got';
import { IncomingMessage } from 'http';
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

export interface PostBody {
  json?: boolean;
  form?: boolean;
  body: any;
}

export class HttpService {
  private readonly LOG = LoggerFactory.getLogger();

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
        body: data.data.toString(),
        ...data,
      };
    } else if (data) {
      this.LOG.warn(`Url[${url}] returned non-html content type: ${data.contentType}`);
      throw new Error('Returned content was not html.');
    } else {
      return undefined;
    }
  }

  public async fetchObject<T>(url: string): Promise<ObjectResponse<T> | undefined> {
    const data: DataResponse | undefined = await this.fetchData(url);
    if (data && data.contentType.toLowerCase().indexOf('application/json') !== -1) {
      return {
        object: JSON.parse(data.data.toString()),
        ...data,
      };
    } else if (data) {
      this.LOG.warn(`Url[${url}] returned non-json content type: ${data.contentType}`);
      throw new Error('Returned content was not valid json.');
    } else {
      return undefined;
    }
  }

  public async fetchData(url: string): Promise<DataResponse | undefined> {
    const response: IncomingMessage = await got(url, { responseType: 'buffer', throwHttpErrors: false });
    if (HttpUtils.isResponseOk(response)) {
      return {
        data: await HttpUtils.toBuffer(response),
        ...this.toHttpResponse(response),
      };
    } else if (response.statusCode === 404) {
      return undefined;
    } else {
      this.LOG.error(`Url[${url}] returned error status code [${response.statusCode}]: \n`, response);
      throw new Error('Data could not be fetched from url.');
    }
  }

  public async postForObject<T>(url: string, body?: any): Promise<ObjectResponse<T> | undefined> {
    const data: DataResponse | undefined = await this.post(url, body);
    if (data && data.contentType.toLowerCase().indexOf('application/json') !== -1) {
      return {
        object: JSON.parse(data.data.toString()),
        ...data,
      };
    } else if (data) {
      this.LOG.warn(`Url[${url}] returned non-json content type: ${data.contentType}`);
      throw new Error('Returned content was not valid json.');
    } else {
      return undefined;
    }
  }

  public async post(url: string, body?: any): Promise<DataResponse | undefined> {
    const response: IncomingMessage = await got.post(url, this.toPostOptions(body));
    if (HttpUtils.isResponseOk(response)) {
      return {
        data: await HttpUtils.toBuffer(response),
        ...this.toHttpResponse(response),
      };
    } else if (response.statusCode === 404) {
      return undefined;
    } else {
      this.LOG.error(`Url[${url}] returned error status code [${response.statusCode}]: \n`, response);
      throw new Error('Error during post to url.');
    }
  }

  private toPostOptions(body?: any): OptionsOfBufferResponseBody {
    const postBody = this.toPostBody(body);
    return {
      responseType: 'buffer',
      form: postBody.form ? postBody.body : undefined,
      json: postBody.json ? postBody.body : undefined,
      body: !postBody.form && !postBody.json ? postBody.body : undefined,
    };
  }

  private toPostBody(body?: any): PostBody {
    if (!body || typeof body !== 'object') {
      return { body };
    }
    const isPostBody = ['form', 'json', 'body'].find(prop => Object.keys(body).includes(prop)) !== undefined;
    return isPostBody ? body : { body };
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
