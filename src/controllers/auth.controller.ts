import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class AuthController {
  
  /**
   * POST /api/auth/login
   * Validates username + password OR pinCode
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, pinCode } = req.body;

      let user = null;

      if (pinCode && !username && !password) {
        // Quick Auth by PIN
        user = await prisma.user.findFirst({ where: { pinCode: String(pinCode) } });
        if (!user) {
          res.status(401).json({ error: 'Noto\'g\'ri PIN-kod' });
          return;
        }
      } else if (username && password) {
        // Credentials Auth
        user = await prisma.user.findUnique({ where: { username } });
        if (!user || user.password !== password) {
          res.status(401).json({ error: 'Noto\'g\'ri parol yoki foydalanuvchi nomi' });
          return;
        }
      } else {
        res.status(400).json({ error: 'Ma\'lumotlar to\'liq emas' });
        return;
      }

      // Successful login
      res.status(200).json({ 
        message: 'Muvaffaqiyatli', 
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          phone: user.phone,
          token: `dummy-jwt-token-${user.id}`
        } 
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Ichki server xatosi' });
    }
  }

  /**
   * GET /api/auth/users
   * Fetch all employees
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { id: 'asc' }
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Ichki server xatosi' });
    }
  }

  /**
   * POST /api/auth/users
   * Create a new employee
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, pinCode, role, name, email, phone, telegramHandle, telegramChatId } = req.body;

      if (!username || !password || !pinCode || !role) {
        res.status(400).json({ error: 'Foydalanuvchi nomi, parol, PIN-kod va rol kiritilishi shart' });
        return;
      }

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        res.status(400).json({ error: 'Ushbu foydalanuvchi nomi band' });
        return;
      }

      // Check if PIN code already exists
      const existingPin = await prisma.user.findFirst({ where: { pinCode: String(pinCode) } });
      if (existingPin) {
        res.status(400).json({ error: 'Ushbu PIN-kod boshqa foydalanuvchiga biriktirilgan' });
        return;
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          username,
          password,
          pinCode: String(pinCode),
          role,
          name: name || '',
          email: email || '',
          phone: phone || '',
          telegramHandle: telegramHandle || '',
          telegramChatId: telegramChatId || ''
        }
      });

      res.status(201).json({
        message: 'Xodim muvaffaqiyatli yaratildi',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          phone: user.phone,
          telegramHandle: user.telegramHandle,
          telegramChatId: user.telegramChatId
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Ichki server xatosi' });
    }
  }

  /**
   * PUT /api/auth/users/:id
   * Update an employee
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { username, password, pinCode, role, name, email, phone, telegramHandle, telegramChatId } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
      if (!existingUser) {
        res.status(404).json({ error: 'Xodim topilmadi' });
        return;
      }

      // Check if username already exists for a DIFFERENT user
      if (username) {
        const userWithSameUsername = await prisma.user.findUnique({ where: { username } });
        if (userWithSameUsername && userWithSameUsername.id !== parseInt(id)) {
          res.status(400).json({ error: 'Ushbu foydalanuvchi nomi band' });
          return;
        }
      }

      // Check if PIN code already exists for a DIFFERENT user
      if (pinCode) {
        const pinString = String(pinCode);
        const userWithSamePin = await prisma.user.findFirst({ where: { pinCode: pinString } });
        if (userWithSamePin && userWithSamePin.id !== parseInt(id)) {
          res.status(400).json({ error: 'Ushbu PIN-kod boshqa foydalanuvchiga biriktirilgan' });
          return;
        }
      }

      // Prepare data to update
      const updateData: any = {};
      if (username !== undefined) updateData.username = username;
      if (password && password.trim() !== '') updateData.password = password; // only update if password provided
      if (pinCode !== undefined) updateData.pinCode = String(pinCode);
      if (role !== undefined) updateData.role = role;
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (telegramHandle !== undefined) updateData.telegramHandle = telegramHandle;
      if (telegramChatId !== undefined) updateData.telegramChatId = telegramChatId;

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.status(200).json({
        message: 'Xodim ma\'lumotlari yangilandi',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Ichki server xatosi' });
    }
  }

  /**
   * DELETE /api/auth/users/:id
   * Delete an employee
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
      if (!existingUser) {
        res.status(404).json({ error: 'Xodim topilmadi' });
        return;
      }

      await prisma.user.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: 'Xodim tizimdan o\'chirildi' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Ichki server xatosi' });
    }
  }
}
