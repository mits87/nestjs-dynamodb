import { DataMapper } from '@aws/dynamodb-data-mapper';
import * as AWS from 'aws-sdk';

import { DynamoDBModuleOptions } from './dynamodb.interface';

export const createDynamodbClient = (options: DynamoDBModuleOptions): AWS.DynamoDB => {
  AWS.config.update(options.AWSConfig);
  return new AWS.DynamoDB(options.dynamoDBOptions);
};

export const createMapper = (dynamoDBClient: AWS.DynamoDB): DataMapper =>
  new DataMapper({ client: dynamoDBClient });
