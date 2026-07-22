import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors.js';

function safelyEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function requireApiKey(validKeys: string[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const authorization = request.header('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

    if (!token || !validKeys.some((key) => safelyEqual(token, key))) {
      next(new HttpError(401, 'A valid bearer token is required.', 'UNAUTHORIZED'));
      return;
    }

    next();
  };
}
