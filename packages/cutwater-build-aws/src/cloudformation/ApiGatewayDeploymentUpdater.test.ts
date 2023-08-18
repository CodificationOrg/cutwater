import { System } from '@codification/cutwater-build-core';
import { ApiGatewayDeploymentUpdater } from './ApiGatewayDeploymentUpdater';

let system: System;
let updater: ApiGatewayDeploymentUpdater;

beforeEach(() => {
  system = System.createNull();
  system.mkdir('temp/test', true);
  system.toFileReference('/cfn-template-test.yaml').write(`
  AWSTemplateFormatVersion: 2010-09-09
  Transform: AWS::Serverless-2016-10-31
  
  Parameters:
    Stage:
      Type: String
      Description: The current deploy stage.
    LoggingLevel:
      Type: String
      Default: WARN
      Description: Logging level for all Lambda functions.
  
  Globals:
    Function:
      Runtime: nodejs10.x
      Tracing: Active
      MemorySize: 256
      Timeout: 5
      Environment:
        Variables:
          LOGGING_LEVEL: !Ref LoggingLevel
          DATA_BUCKET_NAME: !Ref DataBucket
  
  Resources:
    DataBucket:
      Type: AWS::S3::Bucket
        
    RestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        Body:
          Location: /openapi-test.yaml
    RestApiDeployment:
      Type: AWS::ApiGateway::Deployment
      Properties:
        RestApiId: !Ref RestApi
    RestApiStage:
      Type: AWS::ApiGateway::Stage
      DependsOn: ApiGatewayAccount
      Properties:
        Description: !Sub 'Related to deployment: \${RestApiDeployment}'
        DeploymentId: !Ref RestApiDeployment
        RestApiId: !Ref RestApi
        StageName: !Ref Stage
    ApiGatewayCloudWatchRole:
      Type: AWS::IAM::Role
      Properties:
        AssumeRolePolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Principal:
                Service:
                  - 'apigateway.amazonaws.com'
              Action:
                - 'sts:AssumeRole'
        Path: '/'
        ManagedPolicyArns:
          - 'arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs'
    ApiGatewayAccount:
      Type: AWS::ApiGateway::Account
      Properties:
        CloudWatchRoleArn: !GetAtt ApiGatewayCloudWatchRole.Arn
  
    GraphqlHandler:
      Type: AWS::Serverless::Function
      Properties:
        CodeUri: ./packages/comix-lambda/dist/graphqlHandler.js
        Handler: graphqlHandler.handler
  `);
  system.toFileReference('/openapi-test.yaml').write(`
  swagger: "2.0"
  info:
    title: 
      'Test API' 
    description: Test only API.
    version: 2.0.0
  schemes:
    - https
  paths:
    /api/graphql:
      get:
        produces:
          - application/json
        parameters:
          - name: query
            in: query
            description: The graphql query
            required: true
            type: string
        responses:
          '200': 
            description: The results of the query.
          default: 
            description: Unexpected error.
        x-amazon-apigateway-integration:
          uri: 
            'Fn::Sub': 'arn:aws:apigateway:\${AWS::Region}:lambda:path/2015-03-31/functions/\${GraphqlHandler.Arn}/invocations'
          passthroughBehavior: when_no_match
          httpMethod: post
          type: aws_proxy
  `);
  updater = new ApiGatewayDeploymentUpdater(system);
});

describe('ApiGatewayDeploymentUpdater', () => {
  it('can accurately parse a CloudFormation template', () => {
    updater.load('/cfn-template-test.yaml');
    const results = updater.findRestApiResourceNames();
    expect(results.length).toBe(1);
    expect(results[0]).toBe('RestApi');
  });

  it('can find the deployments for a RestApi', () => {
    updater.load('/cfn-template-test.yaml');
    const result = updater.findDeploymentResourceName('RestApi');
    expect(result).toBe('RestApiDeployment');
  });

  it('can merge external swagger files into the RestApi body', () => {
    updater.load('/cfn-template-test.yaml');
    updater.performOpenApiMerges('./temp/test/result.yaml');
    const result = system.toFileReference('./temp/test/result.yaml');
    expect(result.exists()).toBeTruthy();
  });
});
