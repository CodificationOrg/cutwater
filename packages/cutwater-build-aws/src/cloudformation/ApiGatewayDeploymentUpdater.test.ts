import * as fs from 'fs';
import { ApiGatewayDeploymentUpdater } from './ApiGatewayDeploymentUpdater';

beforeAll(() => {
  if (!fs.existsSync('./temp/test')) {
    fs.mkdirSync('./temp/test', { recursive: true });
  }
});

afterAll(() => {
  fs.readdirSync('./temp/test').forEach(file => fs.unlinkSync(`./temp/test/${file}`));
  fs.rmdirSync('./temp/test');
});

describe('ApiGatewayDeploymentUpdater', () => {
  it('can accurately parse a CloudFormation template', () => {
    const updater = new ApiGatewayDeploymentUpdater();
    updater.load('src/cloudformation/cfn-template-test.yaml');
    const results = updater.findRestApiResourceNames();
    expect(results.length).toBe(1);
    expect(results[0]).toBe('RestApi');
  });

  it('can find the deployments for a RestApi', () => {
    const updater = new ApiGatewayDeploymentUpdater();
    updater.load('src/cloudformation/cfn-template-test.yaml');
    const result = updater.findDeploymentResourceName('RestApi');
    expect(result).toBe('RestApiDeployment');
  });

  it('can merge external swagger files into the RestApi body', () => {
    const updater = new ApiGatewayDeploymentUpdater();
    updater.load('src/cloudformation/cfn-template-test.yaml');
    updater.performOpenApiMerges('./temp/test/result.yaml');
    expect(fs.existsSync('./temp/test/result.yaml')).toBeTruthy();
  });
});
