import dayjs from "dayjs";

export const getLocalStartOfDay = (date: string) => {
  return date
    ? dayjs(new Date(date))
      .startOf('day')
      .toISOString()
    : dayjs(new Date()).startOf('day').toISOString()
}

export const getLocalEndOfDay = (date:string) => {
  return date
    ? dayjs(new Date(date))
      .endOf('day')
      .toISOString()
    : dayjs(new Date()).endOf('day').toISOString()
}