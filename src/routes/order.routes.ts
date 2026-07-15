import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

router.post('/create', OrderController.createOrder);
router.post('/confirm', OrderController.confirmOrder);

export default router;
