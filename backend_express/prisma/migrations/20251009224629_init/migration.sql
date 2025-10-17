-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "walletAddress" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizers" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizerName" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "organizerWalletAddress" TEXT,

    CONSTRAINT "Organizers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_walletAddress_key" ON "Users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Organizers_email_key" ON "Organizers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organizers_organizerWalletAddress_key" ON "Organizers"("organizerWalletAddress");
