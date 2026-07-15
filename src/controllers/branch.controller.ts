import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class BranchController {
  static async getBranches(req: Request, res: Response): Promise<void> {
    try {
      let branches = await prisma.branch.findMany();
      if (branches.length === 0) {
        const defaultBranch = await prisma.branch.create({
          data: {
            name: "EcoGas Bosh Filial",
            address: "Toshkent sh., Yunusobod",
            status: "ACTIVE"
          }
        });
        branches = [defaultBranch];
      }
      res.status(200).json({ branches });
    } catch (error) {
      console.error('Error in getBranches:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async createBranch(req: Request, res: Response): Promise<void> {
    try {
      const { name, address } = req.body;
      if (!name || !address) {
        res.status(400).json({ error: 'name and address are required' });
        return;
      }
      const branch = await prisma.branch.create({
        data: {
          name,
          address,
          status: 'ACTIVE'
        }
      });
      res.status(201).json({ branch });
    } catch (error) {
      console.error('Error in createBranch:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
