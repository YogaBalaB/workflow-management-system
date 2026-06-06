import express from 'express';
import { adminController } from '../controllers/adminController.js';

const router = express.Router();

// Get list of all managers
router.get('/managers', adminController.getManagers);

// Create a new manager account
router.post('/managers', adminController.createManager);

// Toggle a manager's enabled state
router.patch('/managers/:id/toggle', adminController.toggleManager);

// Settings management (SLA Response Time Limit)
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;
