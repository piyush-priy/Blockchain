/*
  Warnings:

  - Added the required column `organizerId` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "organizerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "role" SET DEFAULT 'user';

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
