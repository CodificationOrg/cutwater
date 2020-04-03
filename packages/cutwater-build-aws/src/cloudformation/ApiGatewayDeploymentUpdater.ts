import { IOUtils } from '@codification/cutwater-build-core';
import * as md5 from 'md5';
import { schema } from 'yaml-cfn';
import { CloudFormationTemplate } from './CloudFormationTemplate';

export class ApiGatewayDeploymentUpdater {
  private readonly REST_API_TYPE = 'AWS::ApiGateway::RestApi';
  private readonly DEPLOYMENT_TYPE = 'AWS::ApiGateway::Deployment';

  private readonly BODY_PROPERTY = 'Body';
  private readonly TRANSFORM_PROPERTY = 'Fn::Transform';
  private readonly OPENAPI_LOCATION_PROPERTY = 'Location';
  private readonly REST_API_ID_PROPERTY = 'RestApiId';

  private template: CloudFormationTemplate;

  public load(templateFile: string): void {
    this.template = IOUtils.readObjectFromFileSyncSafe<CloudFormationTemplate>(templateFile, undefined, schema);
  }

  public performOpenApiMerges(outputFile: string): void {
    this.validateState();

    const apiToHash: {} = {};
    this.findRestApiResourceNames().forEach(rn => {
      const hash: string | undefined = this.mergeOpenApi(rn);
      if (!!hash) {
        apiToHash[rn] = hash;
      }
    });

    const deployToHash: {} = {};
    Object.keys(apiToHash).forEach(api => {
      const deployName = this.findDeploymentResourceName(api);
      if (!!deployName) {
        deployToHash[deployName] = `${deployName}${apiToHash[api]}`;
        const deployResource: any = this.template.Resources[deployName];
        delete this.template.Resources[deployName];
        this.template.Resources[deployToHash[deployName]] = deployResource;
      }
    });
    this.updateDeploymentReferences(deployToHash);

    IOUtils.writeObjectToFileSync(this.template, outputFile, undefined, schema);
    this.template = {} as CloudFormationTemplate;
  }

  public findRestApiResourceNames(): string[] {
    return this.findResourcesByType(this.REST_API_TYPE);
  }

  public findResourcesByType(resourceType: string): string[] {
    this.validateState();
    return Object.keys(this.template.Resources).filter(rn => this.template.Resources[rn].Type === resourceType);
  }

  public findDeploymentResourceName(restApiName: string): string | undefined {
    this.validateState();
    return this.findResourcesByType(this.DEPLOYMENT_TYPE).find(name => {
      return (
        JSON.stringify(this.template.Resources[name].Properties[this.REST_API_ID_PROPERTY]).indexOf(restApiName) !== -1
      );
    });
  }

  private updateDeploymentReferences(deployNameMapping: any, context: any = this.template): void {
    Object.keys(context).forEach(property => {
      if (typeof context[property] === 'string') {
        context[property] = this.replace(context[property], deployNameMapping);
      } else if (typeof context[property] === 'object') {
        this.updateDeploymentReferences(deployNameMapping, context[property]);
      }
    });
  }

  private replace(value: string, deployNameMapping: any): string {
    let rval = value;
    if (typeof value === 'string') {
      Object.keys(deployNameMapping).some(srcName => {
        const matcher: RegExp = new RegExp('(?=\\W*)' + srcName + '(?=\\W*)', 'g');
        if (matcher.test(value)) {
          rval = value.replace(matcher, deployNameMapping[srcName]);
          return true;
        }
      });
    }
    return rval;
  }

  private mergeOpenApi(restApiName: string): string | undefined {
    const openApi: any | undefined = this.loadOpenApi(restApiName);
    if (!!openApi) {
      this.template.Resources[restApiName].Properties[this.BODY_PROPERTY] = openApi;
    }
    return !!openApi ? this.openApiHash(openApi) : undefined;
  }

  private loadOpenApi(restApiName: string): any | undefined {
    let rval: any | undefined;
    const body: any = this.toRestApiBody(restApiName);
    if (!!body && !!body[this.OPENAPI_LOCATION_PROPERTY]) {
      return IOUtils.readObjectFromFileSync(body[this.OPENAPI_LOCATION_PROPERTY]);
    } else if (!!body && !body[this.TRANSFORM_PROPERTY]) {
      rval = body;
    }
    return rval;
  }

  private toRestApiBody(restApiName: string): string | undefined {
    return this.template.Resources[restApiName].Properties[this.BODY_PROPERTY];
  }

  private openApiHash(openApi: any): string {
    return (md5(JSON.stringify(openApi)) as string).substr(0, 7);
  }

  private validateState(): void {
    if (!this.template || !this.template.Resources) {
      throw new Error('A CloudFormation template has not been loaded!');
    }
  }
}
