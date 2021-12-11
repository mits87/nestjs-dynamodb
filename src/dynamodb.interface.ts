import { CreateTableOptions } from '@aws/dynamodb-data-mapper';
import { Type, ModuleMetadata } from '@nestjs/common';
import { ConfigurationOptions, DynamoDB } from 'aws-sdk';
import { APIVersions } from 'aws-sdk/lib/config';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';

export interface DynamoDBClass {
  new (...args: any[]): any;
}

export interface DynamoDBClassWithOptions {
  id?: string;
  dynamoDBClass: DynamoDBClass;
  tableOptions?: CreateTableOptions;
}

export type DynamoDBInput = DynamoDBClass | DynamoDBClassWithOptions;

export interface DynamoDBModuleOptions {
  dynamoDBOptions: DynamoDB.ClientConfiguration;
  AWSConfig: Partial<ConfigurationOptions & ConfigurationServicePlaceholders & APIVersions>;
}

export interface DynamoDBOptionsFactory {
  createTypegooseOptions(): Promise<DynamoDBModuleOptions> | DynamoDBModuleOptions;
}

export interface DynamoDBModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  useExisting?: Type<DynamoDBOptionsFactory>;
  useClass?: Type<DynamoDBOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<DynamoDBModuleOptions> | DynamoDBModuleOptions;
  inject?: any[];
}
