import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy년 M월 d일', { locale: ko })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy.MM.dd')
}
