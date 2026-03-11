import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** TailwindCSS 클래스 조합 유틸 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
