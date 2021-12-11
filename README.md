# NestJS DynamoDB Mapper

## Description

Opinionated way to use DynamoDB with NestJS and typescript, heavily inspired by [nestjs-typed-dynamodb](https://www.npmjs.com/package/nestjs-typed-dynamodb)

## Getting Started

First install this module

`npm install nestjs-dynamodb`

Notice that it will install as a dependency:

- [dynamodb-data-mapper-annotations](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper-annotations)
- [dynamodb-data-mapper](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper)

## Usage

In order to create a DynamoDB connection

**app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { DynamoDBModule } from 'nestjs-dynamodb';

import { CatsModule } from './cat.module.ts';

@Module({
  imports: [
    DynamoDBModule.forRoot({
      AWSConfig: {},
      dynamoDBOptions: {},
    }),
    CatsModule,
  ],
})
export class AppModule {}
```

**cats.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { DynamoDBModule } from 'nestjs-dynamodb';

import { CatEntity } from './cat.entity';
import { CatsService } from './cats.service';

@Module({
  imports: [DynamoDBModule.forFeature([CatEntity])],
  providers: [CatsService],
})
export class CatsModule {}
```

To insert records to DynamoDB, you first need to create your table, for this we use [dynamodb-data-mapper-annotations](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper-annotations) (under the hood). Every decorator in that package is exposed in this package as well **BUT CAPITALIZED** .

**cat.entity.ts**

```typescript
import { Attribute, ReturnModel, Table } from 'nestjs-dynamodb';
import * as nanoid from 'nanoid';

@Table('cat')
class CatEntity {
  @HashKey({ defaultProvider: nanoid })
  pk: string;

  @RangeKey()
  sk: string;

  @HashKey()
  pk2: string;

  @RangeKey()
  sk2: string;

  @Attribute()
  age: number;

  @Attribute()
  alive?: boolean;

  @Attribute()
  createdAt: Date;

  @Attribute({ defaultProvider: () => new Date() })
  updatedAt: Date;

  // This property will not be saved to DynamoDB.
  notPersistedToDynamoDb: string;
}

export const Cat = ReturnModel<CatEntity>();
```

Note: nanoid is only used a way to assign a random id, feel free to use whatever you want

**cats.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { ReturnModel, InjectModel } from 'nestjs-dynamodb';

import { Cat } from './cat.entity';
import { CatInput } from './cat.input';

@Injectable()
export class CatsService {
  constructor(@InjectModel(CatEntity) private readonly catModel: typeof Cat) {}

  async all(input: Partial<CatInput>): Promise<Cat[]> {
    return this.catModel.query(input);
  }

  async find(id: string): Promise<Cat> {
    return this.catModel.find(id);
  }

  async create(input: CatInput): Promise<Cat> {
    return this.catModel.create(input);
  }

  async delete(input: string): Promise<DynamoDB.DeleteItemOutput> {
    return this.catModel.delete(input);
  }

  async update(id: string, item: CatInput): Promise<Cat> {
    return this.catModel.update(id, item);
  }
}
```

Now you can use your service as you wish!

## Async configuration

**app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { DynamoDBModule } from 'nestjs-dynamodb';

@Module({
  imports: [
    DynamoDBModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        AWSConfig: {
          region: 'local',
          accessKeyId: 'null',
          secretAccessKey: 'null',
        },
        dynamoDBOptions: {
          endpoint: config.get<string>('DYNAMODB_URL', 'localhost:8000'),
          sslEnabled: false,
          region: 'local-env',
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```
