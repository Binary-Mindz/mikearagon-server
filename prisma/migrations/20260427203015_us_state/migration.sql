/*
  Warnings:

  - Changed the type of `state` on the `Client` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `state` on the `DeliveryDetails` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `state` on the `Driver` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `state` on the `PickupDetails` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "USState" AS ENUM ('AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY');

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "state",
ADD COLUMN     "state" "USState" NOT NULL;

-- AlterTable
ALTER TABLE "DeliveryDetails" DROP COLUMN "state",
ADD COLUMN     "state" "USState" NOT NULL;

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "state",
ADD COLUMN     "state" "USState" NOT NULL;

-- AlterTable
ALTER TABLE "PickupDetails" DROP COLUMN "state",
ADD COLUMN     "state" "USState" NOT NULL;
