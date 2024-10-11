import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// https://medium.com/@naglaafouz4/enhancing-component-reusability-in-tailwind-css-with-clsx-and-tailwind-merge-986aa4e1fe76
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

