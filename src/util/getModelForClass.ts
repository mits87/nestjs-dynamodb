import { DataMapper, QueryOptions, QueryIterator } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';

import { getTable } from '.';
import { DynamoDBClass, DynamoDBClassWithOptions } from '../dynamodb.interface';

export type instanceOfDynamoDBClass = InstanceType<DynamoDBClass>;

export class GetModelForClass<T extends instanceOfDynamoDBClass> {
  private pk: string;
  private tableName: string;

  constructor(
    public readonly dynamoDBClassWithOptions: DynamoDBClassWithOptions,
    public readonly dynamoDBClient: DynamoDB,
    public readonly mapper: DataMapper,
  ) {
    this.pk = this.dynamoDBClassWithOptions.id!;
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

  public async find(id: string): Promise<T> {
    return this.mapper.get(
      Object.assign(new this.dynamoDBClassWithOptions.dynamoDBClass(), {
        [this.pk]: id,
      }),
    );
  }

  public async create(input: Partial<T>): Promise<T> {
    return this.mapper.put(Object.assign(new this.dynamoDBClassWithOptions.dynamoDBClass(), input));
  }

  public async update(id: string, input: Partial<DynamoDBClass>): Promise<T> {
    const item = await this.mapper.get(
      Object.assign(new this.dynamoDBClassWithOptions.dynamoDBClass(), {
        [this.pk]: id,
      }),
    );

    return this.mapper.update(Object.assign(item, input));
  }

  public async delete(id: string): Promise<DynamoDB.DeleteItemOutput> {
    return this.dynamoDBClient
      .deleteItem({
        Key: { [this.pk]: { S: id } },
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
