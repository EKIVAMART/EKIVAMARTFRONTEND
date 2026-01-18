import { PrismaClient } from "./generated/prisma/client";


// declare global {
//   var prisma: PrismaClient | undefined;
// }


// export const prisma = globalThis.prisma ?? new PrismaClient({log: ["query", "info", "warn", "error"]});

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;


const prisma = new PrismaClient()

const globalForPrisma = global as unknown as { prisma: typeof prisma }

if (process.env.NODE_ENV != "production") globalForPrisma.prisma = prisma

export default prisma