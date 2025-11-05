/*
  Warnings:

  - A unique constraint covering the columns `[tokenId,eventId]` on the table `Tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Tickets_tokenId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tickets_tokenId_eventId_key" ON "Tickets"("tokenId", "eventId");
