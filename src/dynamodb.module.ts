import { DynamicModule, Module } from '@nestjs/common';

import { DynamoDBCoreModule } from './dynamodb.coremodule';
import {
  DynamoDBModuleAsyncOptions,
  DynamoDBModuleOptions,
  DynamoDBInput,
} from './dynamodb.interface';
import { createDynamoDBProvider } from './dynamodb.providers';
import { getClassWithOptions } from './util';

@Module({})
export class DynamoDBModule {
  public static forRoot(options: DynamoDBModuleOptions): DynamicModule {
    return {
      module: DynamoDBModule,
      imports: [DynamoDBCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: DynamoDBModuleAsyncOptions): DynamicModule {
    return {
      module: DynamoDBModule,
      imports: [DynamoDBCoreModule.forRootAsync(options)],
    };
  }

  public static forFeature(models: DynamoDBInput[]): DynamicModule {
    const providers = createDynamoDBProvider(models.map((model) => getClassWithOptions(model)));

    return {
      module: DynamoDBModule,
      providers,
      exports: providers,
    };
  }
}
