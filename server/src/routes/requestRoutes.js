import express from 'express';
import { requestController } from '../controllers/requestController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { validationMiddleware } from '../middleware/validationMiddleware.js';
import { requestValidator } from '../validators/requestValidator.js';

const router = express.Router();

// Apply auth middleware to all request routes
router.use(authMiddleware);

// Get dashboard statistics (Placed before /:id)
router.get('/stats', requestController.getDashboardStats);

// Get timed-out pending requests for Manager dashboard
router.get('/reminders', roleMiddleware('Manager'), requestController.getRequestReminders);

// Get all requests scoped to role
router.get('/', requestController.getRequests);

// Get a single request details and history
router.get('/:id', requestController.getRequestById);

// Submit a new request (Allowed for standard Users only)
router.post(
  '/', 
  roleMiddleware('User'), 
  validationMiddleware(requestValidator.create), 
  requestController.createRequest
);

// Update request status (Allowed for all roles, checked dynamically by workflow engine)
router.patch(
  '/:id/status', 
  validationMiddleware(requestValidator.updateStatus), 
  requestController.updateRequestStatus
);

export default router;
