import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class DispenserController {
  
  /**
   * GET /api/dispensers/status
   * Returns current status of all dispensers
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const dispensers = await prisma.dispenser.findMany({
        include: {
          fuelType: true
        },
        orderBy: {
          dispenserNumber: 'asc'
        }
      });

      res.status(200).json({ dispensers });
    } catch (error) {
      console.error('Error fetching dispenser status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const dispenserNumber = parseInt(req.params.number as string, 10);

      if (!status || !dispenserNumber) {
        res.status(400).json({ error: 'Missing status or dispenser number' });
        return;
      }

      const updated = await prisma.dispenser.update({
        where: { dispenserNumber },
        data: { status: status as any }
      });

      res.status(200).json({ message: 'Status updated', dispenser: updated });
    } catch (error) {
      console.error('Error updating dispenser status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * POST /api/dispensers
   * Creates a new dispenser
   */
  static async createDispenser(req: Request, res: Response): Promise<void> {
    try {
      const { dispenserNumber, fuelCategory } = req.body;

      if (!dispenserNumber || !fuelCategory) {
        res.status(400).json({ error: 'dispenserNumber and fuelCategory are required' });
        return;
      }

      // Check if dispenser number already exists
      const existing = await prisma.dispenser.findUnique({ where: { dispenserNumber: Number(dispenserNumber) } });
      if (existing) {
        res.status(400).json({ error: `Kalonka #${dispenserNumber} allaqachon mavjud!` });
        return;
      }

      let fuelType = await prisma.fuelType.findFirst({ where: { category: fuelCategory } });
      if (!fuelType) {
        // Auto-create missing fuel types (e.g. AI_80, AI_92, AI_95)
        const defaultPrices: Record<string, number> = {
          METHANE: 3800,
          PROPANE: 5500,
          AI_80: 8500,
          AI_92: 10500,
          AI_95: 12500,
          AI_98: 14000,
          AI_100: 16000
        };
        const defaultNames: Record<string, string> = {
          METHANE: 'Metan (m³)',
          PROPANE: 'Propan (L)',
          AI_80: 'AI-80 (L)',
          AI_92: 'AI-92 (L)',
          AI_95: 'AI-95 (L)',
          AI_98: 'AI-98 (L)',
          AI_100: 'AI-100 (L)'
        };
        
        fuelType = await prisma.fuelType.create({
          data: {
            name: defaultNames[fuelCategory] || fuelCategory,
            category: fuelCategory,
            price: defaultPrices[fuelCategory] || 10000
          }
        });
      }

      const dispenser = await prisma.dispenser.create({
        data: {
          dispenserNumber: Number(dispenserNumber),
          fuelTypeId: fuelType.id,
          status: 'IDLE'
        },
        include: { fuelType: true }
      });

      res.status(201).json({ message: 'Kalonka qo\'shildi', dispenser });
    } catch (error) {
      console.error('Error creating dispenser:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * DELETE /api/dispensers/:number
   * Deletes a dispenser
   */
  static async deleteDispenser(req: Request, res: Response): Promise<void> {
    try {
      const dispenserNumber = parseInt(req.params.number as string, 10);
      await prisma.dispenser.delete({ where: { dispenserNumber } });
      res.status(200).json({ message: 'Kalonka o\'chirildi' });
    } catch (error) {
      console.error('Error deleting dispenser:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * POST /api/dispensers/:number/mock-order
   * Creates a mock COMPLETED order for the dashboard without going through full simulation
   */
  static async mockOrder(req: Request, res: Response): Promise<void> {
    try {
      const dispenserNumber = parseInt(req.params.number as string, 10);
      const { volume, amount, paymentType } = req.body;

      if (!volume || !amount || !paymentType) {
        res.status(400).json({ error: 'Missing volume, amount, or paymentType' });
        return;
      }

      const dispenser = await prisma.dispenser.findUnique({ where: { dispenserNumber } });
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
          paymentType: paymentType,
          status: 'COMPLETED'
        }
      });

      res.status(201).json({ message: 'Mock order created successfully', order });
    } catch (error) {
      console.error('Error creating mock order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
