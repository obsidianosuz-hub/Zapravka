import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class ShiftController {
  static async getActiveShift(req: Request, res: Response): Promise<void> {
    try {
      const { branchId, cashierName } = req.query;
      if (!branchId || !cashierName) {
        res.status(400).json({ error: 'branchId and cashierName are required' });
        return;
      }

      const activeShift = await prisma.shift.findFirst({
        where: {
          branchId: Number(branchId),
          cashierName: String(cashierName),
          status: 'OPEN'
        }
      });

      res.status(200).json({ activeShift });
    } catch (error) {
      console.error('Error in getActiveShift:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async openShift(req: Request, res: Response): Promise<void> {
    try {
      const { branchId, cashierName, startCash, startCounter } = req.body;
      if (!branchId || !cashierName || startCash === undefined || startCounter === undefined) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const existing = await prisma.shift.findFirst({
        where: {
          branchId: Number(branchId),
          cashierName: String(cashierName),
          status: 'OPEN'
        }
      });

      if (existing) {
        res.status(400).json({ error: 'Sizda allaqachon ochiq smena mavjud!', activeShift: existing });
        return;
      }

      const shift = await prisma.shift.create({
        data: {
          branchId: Number(branchId),
          cashierName: String(cashierName),
          startCash: Number(startCash),
          startCounter: Number(startCounter),
          status: 'OPEN'
        }
      });

      res.status(201).json({ shift });
    } catch (error) {
      console.error('Error in openShift:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async closeShift(req: Request, res: Response): Promise<void> {
    try {
      const { shiftId, endCash, endCounter, actualRevenue } = req.body;
      if (!shiftId || endCash === undefined || endCounter === undefined || actualRevenue === undefined) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const shift = await prisma.shift.findUnique({ where: { id: Number(shiftId) } });
      if (!shift) {
        res.status(404).json({ error: 'Smena topilmadi' });
        return;
      }

      if (shift.status === 'CLOSED') {
        res.status(400).json({ error: 'Ushbu smena allaqachon yopilgan' });
        return;
      }

      const volumeSold = Math.max(0, Number(endCounter) - shift.startCounter);
      const expectedRevenue = volumeSold * 3800; // Expected Methane revenue

      const updated = await prisma.shift.update({
        where: { id: Number(shiftId) },
        data: {
          endCash: Number(endCash),
          endCounter: Number(endCounter),
          actualRevenue: Number(actualRevenue),
          expectedRevenue: expectedRevenue,
          status: 'CLOSED',
          endTime: new Date()
        }
      });

      res.status(200).json({ shift: updated });
    } catch (error) {
      console.error('Error in closeShift:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
