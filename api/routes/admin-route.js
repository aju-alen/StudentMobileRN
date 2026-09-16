import express from 'express';
import { verifyToken, requireRole } from '../middlewares/jwt.js';
import {
  getAdminStats,
  getAdminTeachers,
  getAdminOrganizations,
  getAdminParents,
  getAdminPurchases,
} from '../controllers/admin-controller.js';

const router = express.Router();

router.get('/stats', verifyToken, requireRole('ADMIN'), getAdminStats);
router.get('/teachers', verifyToken, requireRole('ADMIN'), getAdminTeachers);
router.get('/organizations', verifyToken, requireRole('ADMIN'), getAdminOrganizations);
router.get('/parents', verifyToken, requireRole('ADMIN'), getAdminParents);
router.get('/purchases', verifyToken, requireRole('ADMIN'), getAdminPurchases);

export default router;
