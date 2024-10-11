/**
 * ? Search: Nextjs Prisma Client
 * ! Ref: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 * 
 * With this config, we are essentially picking only one instance of Prisma Client for the entire application.
 */

import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// ! Know more on declare in Typescript: https://www.geeksforgeeks.org/explain-when-to-use-declare-keyword-in-typescript/
declare const globalThis: {
  prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
