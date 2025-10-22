// Import the PrismaClient
import { PrismaClient } from '@prisma/client';
// Import bcrypt to hash the password
import * as bcrypt from 'bcrypt';

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Define the password hashing rounds
const NUM_SALT_ROUNDS = 10;

async function main() {
  console.log('Start seeding admin user...');

  // 1. Hash the password
  const hashedPassword = await bcrypt.hash('admin123', NUM_SALT_ROUNDS);

  // 2. Create the admin user
  // We use 'upsert' to either create the admin or update it if it already exists
  // This prevents errors if you run the script multiple times.
  const admin = await prisma.users.upsert({
    where: { email: 'admin@ticket.com' },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email: 'admin@ticket.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log(`✅ Admin user created/updated: ${admin.email}`);
}

// 3. Run the 'main' function and handle success or errors
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 4. Disconnect from the database
    await prisma.$disconnect();
  });