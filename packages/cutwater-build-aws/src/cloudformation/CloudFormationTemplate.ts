export interface CloudFormationTemplate {
  Parameters?: any;
  Conditions?: any;
  Globals?: any;
  Resources: {
    [key: string]: CloudFormationResource;
  };
  Outputs?: any;
}

export interface CloudFormationResource {
  Type: string;
  Properties: any;
}
