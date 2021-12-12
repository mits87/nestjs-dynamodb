import { DataMapper, QueryOptions, QueryIterator } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';

import { getTable } from '.';
import { DynamoDBTableAttributes } from '..';
import { DynamoDBClass, DynamoDBClassWithOptions } from '../dynamodb.interface';

export type instanceOfDynamoDBClass = InstanceType<DynamoDBClass>;

export class GetModelForClass<T extends instanceOfDynamoDBClass> {
  private pk: string;
  private sk: string;
  private tableName: string;

  constructor(
    public readonly dynamoDBClassWithOptions: DynamoDBClassWithOptions,
    public readonly dynamoDBClient: DynamoDB,
    public readonly mapper: DataMapper,
  ) {
    this.pk = this.dynamoDBClassWithOptions?.attributes?.pk as string;
    this.sk = this.dynamoDBClassWithOptions?.attributes?.sk as string;

    this.tableName = getTable(this.dynamoDBClassWithOptions.dynamoDBClass);

    this.mapper.ensureTableExists(
      this.dynamoDBClassWithOptions.dynamoDBClass,
      this.dynamoDBClassWithOptions.tableOptions!,
    );
  }

  public async query(
    input: Partial<DynamoDBClass>,
    options?: QueryOptions,
  ): Promise<QueryIterator<T>> {
    return this.mapper.query(this.dynamoDBClassWithOptions.dynamoDBClass, input, options);
  }

  public async find(attr: DynamoDBTableAttributes): Promise<T> {
    return await this.mapper.get(
      Object.assign(new this.dynamoDBClassWithOptions.dynamoDBClass(), {
        [this.pk]: attr[this.pk],
        [this.sk]: attr[this.sk],
      }),
    );
  }

  public async create(input: Partial<T>): Promise<T> {
    return this.mapper.put(Object.assign(new this.dynamoDBClassWithOptions.dynamoDBClass(), input));
  }

  public async update(attr: DynamoDBTableAttributes, input: Partial<DynamoDBClass>): Promise<T> {
    const item = await this.mapper.get(
      Object.assign(new this.dynamoDBClassWithOptions.dynamoDBClass(), {
        [this.pk]: attr[this.pk],
        [this.sk]: attr[this.sk],
      }),
    );

    return this.mapper.update(Object.assign(item, input));
  }

  public async delete(attr: DynamoDBTableAttributes): Promise<DynamoDB.DeleteItemOutput> {
    return this.dynamoDBClient
      .deleteItem({
        Key: {
          [this.pk]: { S: attr[this.pk] },
          [this.sk]: { S: attr[this.sk] },
        },
        TableName: this.tableName,
      })
      .promise();
  }
}

export const getModelForClass = <T extends instanceOfDynamoDBClass>(
  options: DynamoDBClassWithOptions,
  dynamoDBClient: DynamoDB,
  mapper: DataMapper,
) => new GetModelForClass<T>(options, dynamoDBClient, mapper);
