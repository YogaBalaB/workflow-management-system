import { responseHandler } from '../utils/responseHandler.js';

export const errorMiddleware = (err, req, res, next) => {
  console.error('💥 Unhandled Exception:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return responseHandler.error(res, message, err, status);
};
