/*
  Warnings:

  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_ACCEPTED', 'ORDER_PICKED_UP', 'ORDER_DELIVERED', 'TRANSFER_REQUEST', 'TRANSFER_ACCEPTED', 'TRANSFER_REJECTED');

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "fcmToken" TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;
