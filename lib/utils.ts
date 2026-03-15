import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CSV utility functions migrated from the original utils.js
const csvSeparatorRegEx = /,/g

export function sanitize(value: string | undefined | null): string {
  return value ? value.replace(csvSeparatorRegEx, '') : ''
}
