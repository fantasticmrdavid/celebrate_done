import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const isValidDate = (dateString: string) => {
  return !isNaN(Date.parse(dateString))
}

export const getLocalStartOfDay = (date?: string) => {
  return date
    ? dayjs(new Date(date)).startOf('day').toISOString()
    : dayjs(new Date()).startOf('day').toISOString()
}

export const getLocalEndOfDay = (date?: string) => {
  return date
    ? dayjs(new Date(date)).endOf('day').toISOString()
    : dayjs(new Date()).endOf('day').toISOString()
}

export const getLocalStartOfWeek = (date: string) => {
  return date
    ? dayjs(new Date(date)).startOf('week').toISOString()
    : dayjs(new Date()).startOf('week').toISOString()
}

export const getLocalEndOfWeek = (date: string) => {
  return date
    ? dayjs(new Date(date)).endOf('week').toISOString()
    : dayjs(new Date()).endOf('week').toISOString()
}

export const getLocalStartOfMonth = (date: string) => {
  return date
    ? dayjs(new Date(date)).startOf('month').toISOString()
    : dayjs(new Date()).startOf('month').toISOString()
}

export const getLocalEndOfMonth = (date: string) => {
  return date
    ? dayjs(new Date(date)).endOf('month').toISOString()
    : dayjs(new Date()).endOf('month').toISOString()
}

export const getLocalPastSevenDays = (date: string) => {
  return date
    ? dayjs(new Date(date)).subtract(7, 'day').toISOString()
    : dayjs(new Date()).subtract(7, 'day').toISOString()
}

export const getLocalPastNinetyDays = (date: string) => {
  return date
    ? dayjs(new Date(date)).subtract(90, 'day').toISOString()
    : dayjs(new Date()).subtract(90, 'day').toISOString()
}

export const getLocalStartOfYear = (date: string) => {
  return date
    ? dayjs(new Date(date)).startOf('year').toISOString()
    : dayjs(new Date()).startOf('year').toISOString()
}

export const getLocalEndOfYear = (date: string) => {
  return date
    ? dayjs(new Date(date)).endOf('year').toISOString()
    : dayjs(new Date()).endOf('year').toISOString()
}

export const isToday = (d: string) =>
  new Date(d).getDate() === new Date().getDate()
export const isYesterday = (d: string) =>
  new Date(d).getDate() ===
  new Date(new Date().setDate(new Date().getDate() - 1)).getDate()
export const isTomorrow = (d: string) =>
  new Date(d).getDate() ===
  new Date(new Date().setDate(new Date().getDate() + 1)).getDate()

export const getRandomColor = () => {
  let color = Math.floor(Math.random() * 16777215).toString(16)
  while (color.length < 6) {
    color = '0' + color
  }
  return `#${color}`
}
