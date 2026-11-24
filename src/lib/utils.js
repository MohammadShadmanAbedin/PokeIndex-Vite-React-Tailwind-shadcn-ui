import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// helper used by shadcn components to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
