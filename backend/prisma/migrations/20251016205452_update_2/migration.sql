-- CreateTable
CREATE TABLE "Tickets" (
    "id" SERIAL NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "metadataUri" TEXT,
    "ownerWallet" TEXT,
    "status" TEXT NOT NULL DEFAULT 'valid',
    "purchasePrice" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "maxResaleCount" INTEGER NOT NULL DEFAULT 3,
    "priceCap" INTEGER NOT NULL DEFAULT 120,
    "description" TEXT,
    "posterUrl" TEXT,
    "seatLayout" TEXT,
    "type" TEXT,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tickets_tokenId_key" ON "Tickets"("tokenId");

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
