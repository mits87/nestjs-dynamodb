import { DynamoDbTable } from '@aws/dynamodb-data-mapper';

import { DynamoDBClass } from '../dynamodb.interface';

export const getTable = (dynamoDBClass: DynamoDBClass): string =>
  dynamoDBClass.prototype[DynamoDbTable];
