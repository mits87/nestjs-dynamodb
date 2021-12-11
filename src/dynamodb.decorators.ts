import { Inject } from '@nestjs/common';

import { DynamoDBClass } from './dynamodb.interface';
import { getModelToken, getModelForClass } from './util';

export function InjectModel(model: DynamoDBClass) {
  return Inject(getModelToken(model.name));
}

export function ReturnModel<T>(v?: any) {
  return (false as true) && getModelForClass<T>(v, v, v);
}
