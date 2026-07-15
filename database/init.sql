-- EcoGas Automation Phase 1 Database Schema (PostgreSQL)

-- 1. Create ENUM types
CREATE TYPE "PaymentType" AS ENUM ('BANK_CARD', 'CORPORATE_ACCOUNT');
CREATE TYPE "DispenserStatus" AS ENUM ('IDLE', 'BUSY', 'OFFLINE');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'DISPENSING', 'COMPLETED', 'FAILED');
CREATE TYPE "FuelCategory" AS ENUM ('METHANE', 'PROPANE');

-- 2. Create FuelType Table
CREATE TABLE "FuelType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FuelCategory" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FuelType_name_key" ON "FuelType"("name");

-- 3. Create CorporateClient Table
CREATE TABLE "CorporateClient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limit" DOUBLE PRECISION,
    "contactInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateClient_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CorporateClient_name_key" ON "CorporateClient"("name");

-- 4. Create Dispenser Table
CREATE TABLE "Dispenser" (
    "id" SERIAL NOT NULL,
    "dispenserNumber" TEXT NOT NULL,
    "status" "DispenserStatus" NOT NULL DEFAULT 'IDLE',
    "fuelTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispenser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Dispenser_dispenserNumber_key" ON "Dispenser"("dispenserNumber");
ALTER TABLE "Dispenser" ADD CONSTRAINT "Dispenser_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. Create Order Table
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "dispenserId" INTEGER NOT NULL,
    "fuelTypeId" INTEGER NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "corporateClientId" INTEGER,
    "terminalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Order" ADD CONSTRAINT "Order_dispenserId_fkey" FOREIGN KEY ("dispenserId") REFERENCES "Dispenser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "CorporateClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
