import { DATABASE_URL } from '../../constant/index.js';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const initializeDatabase = () =>
  new Promise(async (resolve, reject) => {
    try {
      await prisma.$connect();
      resolve("Database connection established");
    } catch (err) {
      reject(err);
    }
  });

export { prisma };
export default initializeDatabase;
