import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { DispenserSimulationService } from '../simulation/dispenser.service';

export class OrderController {
  
  /**
   * POST /api/orders/create
   * Creates a new order. Validates corporate client balance if applicable.
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { dispenserId, fuelTypeId, volume, paymentType, corporateClientId } = req.body;

      if (!dispenserId || !fuelTypeId || !volume || !paymentType) {
         res.status(400).json({ error: 'Missing required fields' });
         return;
      }

      // Check dispenser status
      const dispenser = await prisma.dispenser.findUnique({ where: { id: dispenserId } });
      if (!dispenser || dispenser.status !== 'IDLE') {
        res.status(400).json({ error: 'Dispenser is not available' });
        return;
      }

      // Check fuel type and calculate amount
      const fuelType = await prisma.fuelType.findUnique({ where: { id: fuelTypeId } });
      if (!fuelType) {
        res.status(404).json({ error: 'Fuel type not found' });
        return;
      }

      const totalAmount = volume * fuelType.price;

      // If corporate account, check balance and limits
      if (paymentType === 'CORPORATE_ACCOUNT') {
        if (!corporateClientId) {
          res.status(400).json({ error: 'corporateClientId is required for CORPORATE_ACCOUNT' });
          return;
        }

        const client = await prisma.corporateClient.findUnique({ where: { id: corporateClientId } });
        if (!client) {
          res.status(404).json({ error: 'Corporate client not found' });
          return;
        }

        if (client.balance < totalAmount) {
          res.status(400).json({ error: 'Insufficient balance' });
          return;
        }
      }

      // Create Order
      const order = await prisma.order.create({
        data: {
          dispenserId,
          fuelTypeId,
          volume,
          totalAmount,
          paymentType,
          corporateClientId: corporateClientId || null,
          status: 'PENDING'
        }
      });

      res.status(201).json({ message: 'Order created', order });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * POST /api/orders/confirm
   * Confirms payment and starts dispensing
   */
  static async confirmOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, terminalId } = req.body;

      if (!orderId) {
        res.status(400).json({ error: 'orderId is required' });
        return;
      }

      // Find order
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.status !== 'PENDING') {
        res.status(400).json({ error: 'Order is not in PENDING status' });
        return;
      }

      if (order.paymentType === 'BANK_CARD' && !terminalId) {
        res.status(400).json({ error: 'terminalId is required for BANK_CARD payment confirmation' });
        return;
      }

      // Check if dispenser is still IDLE
      const dispenser = await prisma.dispenser.findUnique({ where: { id: order.dispenserId } });
      if (!dispenser || dispenser.status !== 'IDLE') {
        res.status(400).json({ error: 'Dispenser became unavailable' });
        return;
      }

      // Update Order and Dispenser Status in a transaction
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Update Dispenser to BUSY
        await tx.dispenser.update({
          where: { id: order.dispenserId },
          data: { status: 'BUSY' }
        });

        // Update Order to DISPENSING
        return tx.order.update({
          where: { id: orderId },
          data: { 
            status: 'DISPENSING'
          }
        });
      });

      // Call Mock Service to simulate dispensing
      DispenserSimulationService.startDispensing(updatedOrder.id);

      res.status(200).json({ message: 'Payment confirmed. Dispensing started.', order: updatedOrder });
    } catch (error) {
      console.error('Error confirming order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
