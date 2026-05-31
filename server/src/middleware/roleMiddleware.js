import { responseHandler } from '../utils/responseHandler.js';

/**
 * Authorize access based on allowed user roles
 * @param {...string} allowedRoles - Roles allowed to access the route ('User', 'Manager', 'Admin')
 */
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return responseHandler.error(res, 'Authentication required.', null, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return responseHandler.error(
        res, 
        `Access Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`, 
        null, 
        403
      );
    }

    next();
  };
};
