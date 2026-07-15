import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

router.post('/create-order', PaymentController.createOrder);
router.get('/status/:orderId', PaymentController.checkStatus);
router.post('/click', PaymentController.clickWebhook);

export default router;
