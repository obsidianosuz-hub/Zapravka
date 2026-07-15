import { prisma } from '../config/db';

/**
 * Mocks the dispenser fueling process.
 * In a real-world scenario, this would communicate via Modbus/PLC with the physical dispenser.
 */
export class DispenserSimulationService {
  /**
   * Starts the dispensing process for a given order.
   * @param orderId ID of the order to dispense
   */
  static async startDispensing(orderId: number) {
    try {
      // 1. Fetch order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { dispenser: true, corporateClient: true },
      });

      if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
      }

      if (order.status !== 'DISPENSING') {
        console.warn(`Order ${orderId} is not in DISPENSING state.`);
        return;
      }

      console.log(`[SIMULATION] Dispenser ${order.dispenser.dispenserNumber} started fueling for order ${orderId}. Volume: ${order.volume}`);

      // 2. Simulate fueling time (e.g., 1 second per unit, max 10 seconds for demo)
      const simulationTime = Math.min(order.volume * 1000, 10000) || 5000;

      setTimeout(async () => {
        console.log(`[SIMULATION] Dispenser ${order.dispenser.dispenserNumber} finished fueling for order ${orderId}.`);

        // 3. Complete order and reset dispenser status
        await prisma.$transaction(async (tx) => {
          // Update Order
          await tx.order.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
          });

          // Update Dispenser status
          await tx.dispenser.update({
            where: { id: order.dispenserId },
            data: { status: 'IDLE' },
          });

          // Deduct corporate client balance if applicable
          if (order.paymentType === 'CORPORATE_ACCOUNT' && order.corporateClientId) {
            await tx.corporateClient.update({
              where: { id: order.corporateClientId },
              data: { balance: { decrement: order.totalAmount } },
            });
            console.log(`[SIMULATION] Deducted ${order.totalAmount} UZS from corporate client ${order.corporateClientId}`);
          }
          
        });

      }, simulationTime);

    } catch (error) {
      console.error(`[SIMULATION] Error during dispensing order ${orderId}:`, error);
      
      // If error occurs, ideally we set order to FAILED and Dispenser to IDLE or OFFLINE
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'FAILED' }
        });
      } catch (e) {}
    }
  }
}
