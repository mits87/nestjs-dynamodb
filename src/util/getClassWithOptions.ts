import { DynamoDBClassWithOptions, DynamoDBInput } from '../dynamodb.interface';

export const getClassWithOptions = (item: DynamoDBInput): DynamoDBClassWithOptions => {
  switch (typeof item) {
    case 'function':
      return {
        id: 'pk',
        dynamoDBClass: item,
        tableOptions: {
          readCapacityUnits: 5,
          writeCapacityUnits: 5,
        },
      };

    case 'object':
      return item;

    default:
      throw new Error('Invalid model object');
  }
};
