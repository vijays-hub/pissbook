import { Options as HashConfig } from "@node-rs/argon2";

// https://www.npmjs.com/package/@node-rs/argon2
export const hashingConfig: HashConfig = {
  memoryCost: 19456, // The amount of memory to be used by the hash function, in kilobytes
  timeCost: 2, // The time cost is the amount of passes (iterations) used by the hash function. It increases hash strength at the cost of time required to compute.
  outputLen: 32, // The length of the hash in bytes
  parallelism: 1, // The number of threads to use
};
