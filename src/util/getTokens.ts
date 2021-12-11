const MODEL_NAME = 'DynamoDBModel';

export const getModelToken = (name: string) => `__${name}${MODEL_NAME}__`;
export const getConnectionToken = (name: string) => `__${name}${MODEL_NAME}__`;
