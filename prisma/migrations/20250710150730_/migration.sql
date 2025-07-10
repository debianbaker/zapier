/*
  Warnings:

  - You are about to drop the column `time` on the `ZapRun` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ZapRun" DROP COLUMN "time",
ADD COLUMN     "triggerTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ZapRunOutbox" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
