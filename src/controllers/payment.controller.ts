import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class PaymentController {
  /**
   * POST /api/payment/create-order
   * Creates a PENDING order for a dispenser to initiate a Click payment
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { dispenserNumber, volume, amount } = req.body;

      if (!dispenserNumber || !volume || !amount) {
        res.status(400).json({ error: 'dispenserNumber, volume, and amount are required' });
        return;
      }

      const dispenser = await prisma.dispenser.findUnique({ where: { dispenserNumber: Number(dispenserNumber) } });
      if (!dispenser) {
        res.status(404).json({ error: 'Dispenser not found' });
        return;
      }

      const order = await prisma.order.create({
        data: {
          dispenserId: dispenser.id,
          fuelTypeId: dispenser.fuelTypeId,
          volume: parseFloat(volume),
          totalAmount: parseFloat(amount),
          paymentType: 'BANK_CARD', // Matches database schema constraint
          status: 'PENDING'
        }
      });

      // Generate Click payment redirect URL
      const serviceId = process.env.CLICK_SERVICE_ID || '12345';
      const merchantId = process.env.CLICK_MERCHANT_ID || '54321';
      const returnUrl = `http://localhost:5173/cashier`;
      
      const clickUrl = `https://my.click.uz/services/click-partner/payment?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${order.id}&return_url=${encodeURIComponent(returnUrl)}`;

      res.status(201).json({ 
        message: 'Click order initialized', 
        orderId: order.id,
        clickUrl 
      });
    } catch (error) {
      console.error('Error creating Click order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /api/payment/status/:orderId
   * Check if a pending Click order has been paid (completed)
   */
  static async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.orderId as string, 10);
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.status(200).json({ status: order.status });
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * POST /api/payment/click
   * Handles Click webhook server-to-server integration
   */
  static async clickWebhook(req: Request, res: Response): Promise<void> {
    try {
      const {
        click_trans_id,
        service_id,
        click_paydoc_id,
        merchant_trans_id,
        amount,
        action,
        error,
        error_note,
        sign_time,
        sign_string
      } = req.body;

      // Click standard signature verification
      // md5(click_trans_id + service_id + secret_key + merchant_trans_id + amount + action + sign_time)
      const secretKey = process.env.CLICK_SECRET_KEY || 'click_secret_123';
      const hashString = `${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${amount}${action}${sign_time}`;
      const mySignature = crypto.createHash('md5').update(hashString).digest('hex');

      if (sign_string !== mySignature) {
        res.json({
          error: -1,
          error_note: 'Sign check failed'
        });
        return;
      }

      const orderId = parseInt(merchant_trans_id, 10);
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order) {
        res.json({
          error: -5,
          error_note: 'User/Order does not exist'
        });
        return;
      }

      if (parseFloat(amount) !== order.totalAmount) {
        res.json({
          error: -2,
          error_note: 'Incorrect parameter amount'
        });
        return;
      }

      // PREPARE Action (action == 0)
      if (parseInt(action, 10) === 0) {
        res.json({
          click_trans_id: Number(click_trans_id),
          merchant_trans_id: merchant_trans_id,
          status: 0,
          error: 0,
          error_note: 'Success'
        });
        return;
      }

      // COMPLETE Action (action == 1)
      if (parseInt(action, 10) === 1) {
        if (order.status === 'COMPLETED') {
          // Idempotency: order already paid
          res.json({
            click_trans_id: Number(click_trans_id),
            merchant_trans_id: merchant_trans_id,
            status: 0,
            error: 0,
            error_note: 'Already paid'
          });
          return;
        }

        // Update database order status to COMPLETED
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' }
        });

        res.json({
          click_trans_id: Number(click_trans_id),
          merchant_trans_id: merchant_trans_id,
          status: 0,
          error: 0,
          error_note: 'Success'
        });
        return;
      }

      res.json({
        error: -3,
        error_note: 'Action not found'
      });
    } catch (error) {
      console.error('Error handling Click webhook:', error);
      res.json({
        error: -9,
        error_note: 'Internal server error'
      });
    }
  }
}
