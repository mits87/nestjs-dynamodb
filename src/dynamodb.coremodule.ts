import { DataMapper } from '@aws/dynamodb-data-mapper';
import { Module, Global, DynamicModule, Provider } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk';

import { createMapper, createDynamodbClient } from './dynamodb.config';
import {
  DYNAMO_DB_CLIENT,
  DYNAMO_DB_DATA_MAPPER,
  DYNAMO_DB_MODULE_OPTIONS,
} from './dynamodb.constants';
import { DynamoDBModuleAsyncOptions, DynamoDBModuleOptions } from './dynamodb.interface';

@Global()
@Module({})
export class DynamoDBCoreModule {
  public static forRoot(options: DynamoDBModuleOptions): DynamicModule {
    const dynamodbClient = createDynamodbClient(options);

    const mapper = createMapper(dynamodbClient);

    const clientProvider = {
      provide: DYNAMO_DB_CLIENT,
      useValue: dynamodbClient,
    };

    const dataMapperProvider = {
      provide: DYNAMO_DB_DATA_MAPPER,
      useValue: mapper,
    };

    return {
      module: DynamoDBCoreModule,
      providers: [dataMapperProvider, clientProvider],
      exports: [dataMapperProvider, clientProvider],
    };
  }

  public static forRootAsync(options: DynamoDBModuleAsyncOptions): DynamicModule {
    const clientProvider = {
      provide: DYNAMO_DB_CLIENT,
      useFactory: (dynamoDBModuleOptions: DynamoDBModuleOptions): DynamoDB =>
        createDynamodbClient(dynamoDBModuleOptions),
      inject: [DYNAMO_DB_MODULE_OPTIONS], // inject output of async config creator
    };
    const dataMapperProvider = {
      provide: DYNAMO_DB_DATA_MAPPER,
      useFactory: (dynamoDB: DynamoDB): DataMapper => createMapper(dynamoDB),
      inject: [DYNAMO_DB_CLIENT], // inject output of async config creator
    };

    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: DynamoDBCoreModule,
      imports: options.imports, // imports from async for root
      providers: [...asyncProviders, dataMapperProvider, clientProvider],
      exports: [dataMapperProvider, clientProvider],
    };
  }

  private static createAsyncProviders(options: DynamoDBModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory)
      return [this.createAsyncOptionsProvider(options)];

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: DynamoDBModuleAsyncOptions): Provider {
    if (options.useFactory)
      return {
        provide: DYNAMO_DB_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    return {
      provide: DYNAMO_DB_MODULE_OPTIONS,
      useFactory: () => null,
      inject: [],
    };
  }
}
