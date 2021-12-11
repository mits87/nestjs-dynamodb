import { DataMapper } from '@aws/dynamodb-data-mapper';
import { FactoryProvider } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk';

import { DYNAMO_DB_CLIENT, DYNAMO_DB_DATA_MAPPER } from './dynamodb.constants';
import { DynamoDBClass, DynamoDBClassWithOptions } from './dynamodb.interface';
import { getModelForClass, getModelToken } from './util';

export function createDynamoDBProvider(models: DynamoDBClassWithOptions[]): FactoryProvider[] {
  return models.reduce(
    (providers: FactoryProvider[], dynamoDBClassWithOptions: DynamoDBClassWithOptions) => [
      ...providers,
      {
        provide: getModelToken(dynamoDBClassWithOptions.dynamoDBClass.name),
        useFactory: (dynamoDBClient: DynamoDB, mapper: DataMapper) =>
          getModelForClass<InstanceType<DynamoDBClass>>(
            dynamoDBClassWithOptions,
            dynamoDBClient,
            mapper,
          ),
        inject: [DYNAMO_DB_CLIENT, DYNAMO_DB_DATA_MAPPER],
      },
    ],
    [],
  );
}
