import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { responseHandler } from '../utils/responseHandler.js';

export const authMiddleware = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return responseHandler.error(res, 'Access denied. No authentication token provided.', null, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return responseHandler.error(res, 'Invalid or expired authentication token.', err, 401);
  }
};
