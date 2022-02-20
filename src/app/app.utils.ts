import * as express from 'express';
import { CreateQueryData, UpdateQueryData } from '../shared/models';

export class Logger {
  private origin: string;

  constructor(pathToFile: string) {
    /**
     * TODO: enable higher JS version
     * this.orign = pathToFile.split('/').at(-1);
     */
    const split = pathToFile.split('/');
    this.origin = split[split.length - 1];
  }

  /**
   * Logs a message and an error to the console.
   * @param message - message to log.
   * @param error - error to log.
   */
  public log(message: string, error?: Error): void {
    error
      ? console.log(`***** [${this.origin}] *****: ${message}`, error)
      : console.log(`***** [${this.origin}] *****: ${message}`);
  }
}

export function handleErrorWithStatus(
  status: number,
  e: Error,
  req: express.Request,
  res: express.Response,
  logger: Logger
): void {
  const message = `${req.method} ${req.url}, Body: ${JSON.stringify(req.body)}`;
  logger.log(message, e);
  res.sendStatus(status);
}

/**
 * Parses an object into a string for the pg CREATE query and returns the object's
 * values as an array.
 * @param value - object that should be included in the query, e.g. request body.
 * @returns
 */
export function parseValuesForCreateQuery<T extends Record<string, unknown>>(
  value: T
): CreateQueryData {
  const keys = Object.keys(value).join(', ');
  const values = Object.values(value);
  const refs = values.map((v, i) => `$${i + 1}`).join(', ');
  return {
    keys,
    refs,
    values,
  };
}

/**
 * Parses an object into a string for the pg UPDATE query and returns the object's
 * values as an array.
 * @param value - object that should be included in the query, e.g. request body.
 * @returns
 */
export function parseValuesForUpdateQuery<T extends Record<string, unknown>>(
  value: T
): UpdateQueryData {
  const keys = Object.keys(value);
  const values = Object.values(value);
  const keysAndRefs = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  return {
    keysAndRefs,
    values,
  };
}

/**
 * Validates request body considering required and allowed properties.
 * @param body - the request body to validate.
 * @param requiredProps - an object with required properties of the model.
 * @param allowedProps - an object with all allowed properties of the model.
 * @returns
 */
export const isValidRequestBody = <T extends Record<string, unknown>>(
  body: T,
  requiredProps: T,
  allowedProps: T
): boolean => {
  for (const prop in requiredProps) {
    if (!(prop in body)) {
      return false;
    }
  }
  for (const prop in body) {
    if (!(prop in allowedProps)) {
      return false;
    }
  }
  return true;
};
