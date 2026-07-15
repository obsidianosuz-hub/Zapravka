import { Router } from 'express';
import { ShiftController } from '../controllers/shift.controller';

const router = Router();
router.get('/active', ShiftController.getActiveShift);
router.post('/open', ShiftController.openShift);
router.post('/close', ShiftController.closeShift);

export default router;
