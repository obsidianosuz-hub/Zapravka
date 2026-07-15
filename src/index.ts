import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/order.routes';
import dispenserRoutes from './routes/dispenser.routes';
import dashboardRoutes from './routes/dashboard.routes';
import authRoutes from './routes/auth.routes';
import paymentRoutes from './routes/payment.routes';
import branchRoutes from './routes/branch.routes';
import shiftRoutes from './routes/shift.routes';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/dispensers', dispenserRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/shifts', shiftRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[SERVER] EcoGas Automation API running on port ${PORT}`);
});

