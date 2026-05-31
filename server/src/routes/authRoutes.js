import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validationMiddleware } from '../middleware/validationMiddleware.js';
import { authValidator } from '../validators/authValidator.js';

const router = express.Router();

// Public login route
router.post('/login', validationMiddleware(authValidator.login), authController.login);

// Public register route
router.post('/register', validationMiddleware(authValidator.register), authController.register);

// Protected profile route
router.get('/me', authMiddleware, authController.getProfile);

export default router;
