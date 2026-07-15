import { Router } from 'express';
import { DispenserController } from '../controllers/dispenser.controller';

const router = Router();

router.get('/status', DispenserController.getStatus);
router.put('/:number/status', DispenserController.updateStatus);
router.post('/:number/mock-order', DispenserController.mockOrder);
router.post('/', DispenserController.createDispenser);
router.delete('/:number', DispenserController.deleteDispenser);

export default router;

