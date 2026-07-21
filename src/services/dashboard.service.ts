import { prisma } from '../config/db';

export class DashboardService {
  /**
   * Retrieves aggregated statistics based on the specified period.
   * @param period 'daily' | 'weekly' | 'monthly' | 'yearly'
   */
  static async getStats(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    let dateFilter = new Date();
    
    // Set date filter based on period
    if (period === 'daily') {
      dateFilter.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      const day = dateFilter.getDay();
      const diff = dateFilter.getDate() - day + (day === 0 ? -6 : 1);
      dateFilter = new Date(dateFilter.setDate(diff));
      dateFilter.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      dateFilter.setDate(1);
      dateFilter.setHours(0, 0, 0, 0);
    } else if (period === 'yearly') {
      dateFilter.setMonth(0, 1);
      dateFilter.setHours(0, 0, 0, 0);
    }

    // 1. Fetch all completed orders for the period
    const fuelGroups = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: dateFilter }
      },
      include: { fuelType: true }
    });

    let totalRevenue = 0;
    
    // Global Payment Split
    const paymentSplit = {
      BANK_CARD: { amount: 0, percentage: 0 },
      CASH: { amount: 0, percentage: 0 },
      MIXED: { amount: 0, percentage: 0 }
    };

    // Gas Payment Split
    const gasPaymentSplit = {
      BANK_CARD: { amount: 0, percentage: 0 },
      CASH: { amount: 0, percentage: 0 },
      MIXED: { amount: 0, percentage: 0 }
    };
    let totalGasRevenue = 0;

    // Petrol Payment Split
    const petrolPaymentSplit = {
      BANK_CARD: { amount: 0, percentage: 0 },
      CASH: { amount: 0, percentage: 0 },
      MIXED: { amount: 0, percentage: 0 }
    };
    let totalPetrolRevenue = 0;

    // Electric Payment Split
    const electricPaymentSplit = {
      BANK_CARD: { amount: 0, percentage: 0 },
      CASH: { amount: 0, percentage: 0 },
      MIXED: { amount: 0, percentage: 0 }
    };
    let totalElectricRevenue = 0;
    let electricVolume = 0;

    let methaneVolume = 0;
    let methaneRevenue = 0;
    let propaneVolume = 0;
    let propaneRevenue = 0;
    let petrolVolume = { AI_80: 0, AI_92: 0, AI_95: 0, AI_98: 0, AI_100: 0 };
    let petrolRevenue = { AI_80: 0, AI_92: 0, AI_95: 0, AI_98: 0, AI_100: 0 };

    fuelGroups.forEach(order => {
      const cat = order.fuelType.category;
      const amount = order.totalAmount;
      totalRevenue += amount;
      
      // @ts-ignore
      if (paymentSplit[order.paymentType]) {
        // @ts-ignore
        paymentSplit[order.paymentType].amount += amount;
      }

      if (cat === 'METHANE' || cat === 'PROPANE') {
        totalGasRevenue += amount;
        // @ts-ignore
        if (gasPaymentSplit[order.paymentType]) {
          // @ts-ignore
          gasPaymentSplit[order.paymentType].amount += amount;
        }

        if (cat === 'METHANE') {
          methaneVolume += order.volume;
          methaneRevenue += amount;
        } else {
          propaneVolume += order.volume;
          propaneRevenue += amount;
        }
      } else if (cat === 'ELECTRIC') {
        totalElectricRevenue += amount;
        electricVolume += order.volume;
        // @ts-ignore
        if (electricPaymentSplit[order.paymentType]) {
          // @ts-ignore
          electricPaymentSplit[order.paymentType].amount += amount;
        }
      } else {
        totalPetrolRevenue += amount;
        // @ts-ignore
        if (petrolPaymentSplit[order.paymentType]) {
          // @ts-ignore
          petrolPaymentSplit[order.paymentType].amount += amount;
        }

        if (cat === 'AI_80') {
          petrolVolume.AI_80 += order.volume;
          petrolRevenue.AI_80 += amount;
        } else if (cat === 'AI_92') {
          petrolVolume.AI_92 += order.volume;
          petrolRevenue.AI_92 += amount;
        } else if (cat === 'AI_95') {
          petrolVolume.AI_95 += order.volume;
          petrolRevenue.AI_95 += amount;
        } else if (cat === 'AI_98') {
          petrolVolume.AI_98 += order.volume;
          petrolRevenue.AI_98 += amount;
        } else if (cat === 'AI_100') {
          petrolVolume.AI_100 += order.volume;
          petrolRevenue.AI_100 += amount;
        }
      }
    });

    // Calculate percentages
    ['BANK_CARD', 'CASH', 'MIXED'].forEach(type => {
      // @ts-ignore
      paymentSplit[type].percentage = totalRevenue > 0 ? (paymentSplit[type].amount / totalRevenue) * 100 : 0;
      // @ts-ignore
      gasPaymentSplit[type].percentage = totalGasRevenue > 0 ? (gasPaymentSplit[type].amount / totalGasRevenue) * 100 : 0;
      // @ts-ignore
      petrolPaymentSplit[type].percentage = totalPetrolRevenue > 0 ? (petrolPaymentSplit[type].amount / totalPetrolRevenue) * 100 : 0;
      // @ts-ignore
      electricPaymentSplit[type].percentage = totalElectricRevenue > 0 ? (electricPaymentSplit[type].amount / totalElectricRevenue) * 100 : 0;
    });

    // Power consumption efficiency for METHANE
    const powerConsumptions = await prisma.powerConsumption.aggregate({
      where: { recordedAt: { gte: dateFilter } },
      _sum: { kwhConsumed: true }
    });
    const totalKwh = powerConsumptions._sum.kwhConsumed || 0;
    const powerEfficiencyMethane = methaneVolume > 0 ? (totalKwh / methaneVolume) : 0;

    const fuelSplit = {
      METHANE: {
        volume_m3: methaneVolume,
        total_revenue: methaneRevenue,
        avg_kwh_per_m3: powerEfficiencyMethane
      },
      PROPANE: {
        volume_l: propaneVolume,
        total_revenue: propaneRevenue
      },
      AI_80: { volume_l: petrolVolume.AI_80, total_revenue: petrolRevenue.AI_80 },
      AI_92: { volume_l: petrolVolume.AI_92, total_revenue: petrolRevenue.AI_92 },
      AI_95: { volume_l: petrolVolume.AI_95, total_revenue: petrolRevenue.AI_95 },
      AI_98: { volume_l: petrolVolume.AI_98, total_revenue: petrolRevenue.AI_98 },
      AI_100: { volume_l: petrolVolume.AI_100, total_revenue: petrolRevenue.AI_100 },
      ELECTRIC: { volume_l: electricVolume, total_revenue: totalElectricRevenue }
    };

    // 4. Peak Hours (using raw query for time bucketing in SQLite)
    // We group by 2-hour intervals for the selected period
    // In SQLite, strftime('%H', createdAt) gets the hour (00-23).
    const peakHoursRaw = await prisma.$queryRaw`
      SELECT 
        (CAST(strftime('%H', createdAt) AS INTEGER) / 2) * 2 AS hour_bucket,
        COUNT(id) as transaction_count,
        SUM(totalAmount) as total_sum
      FROM "Order"
      WHERE status = 'COMPLETED' AND createdAt >= ${dateFilter}
      GROUP BY hour_bucket
      ORDER BY hour_bucket ASC;
    `;

    const formattedPeakHours = (peakHoursRaw as any[]).map(row => ({
      hour_bucket: Number(row.hour_bucket),
      transaction_count: Number(row.transaction_count),
      total_sum: Number(row.total_sum || 0)
    }));

    return {
      totalRevenue,
      paymentSplit,
      gasPaymentSplit,
      petrolPaymentSplit,
      electricPaymentSplit,
      fuelSplit,
      peakHours: formattedPeakHours
    };
  }

  /**
   * Retrieves live status of dispensers, recent transactions, and telemetry data.
   * Also performs alert logic evaluation.
   */
  static async getLiveStatus() {
    // 1. Dispensers status
    const dispensers = await prisma.dispenser.findMany({
      select: { id: true, dispenserNumber: true, status: true, fuelTypeId: true, fuelType: { select: { category: true } } }
    });

    // 2. Last 10 successful transactions
    const recentOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { fuelType: { select: { category: true } } }
    });

    // 3. Current compressor pressure and propane levels
    const compressor = await prisma.compressorTelemetry.findFirst({
      orderBy: { recordedAt: 'desc' }
    });
    
    const propaneStorage = await prisma.gasStorage.findUnique({
      where: { fuelCategory: 'PROPANE' }
    });

    let propanePercentage = 0;
    if (propaneStorage && propaneStorage.maxCapacity > 0) {
      propanePercentage = (propaneStorage.currentLevel / propaneStorage.maxCapacity) * 100;
    }

    const liveData = {
      dispensers,
      recentTransactions: recentOrders,
      compressorPressureBar: compressor?.pressureBar || 0,
      propaneRemainingPercent: propanePercentage
    };

    // 4. Alert Logic Evaluation
    if (liveData.compressorPressureBar < 180 || liveData.propaneRemainingPercent < 15) {
      console.warn("ALERT: Critical storage/pressure level!");
      // Logic for sending to Telegram bot would go here
    }

    return liveData;
  }
}
