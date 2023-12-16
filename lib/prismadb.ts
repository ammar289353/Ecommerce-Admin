import { PrismaClient } from "@prisma/client";

declare global {
  interface NodeJSGlobal {
    prisma?: PrismaClient;
  }
}

const prismadb: PrismaClient = (global as NodeJSGlobal).prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") (global as NodeJSGlobal).prisma = prismadb;

export default prismadb;
