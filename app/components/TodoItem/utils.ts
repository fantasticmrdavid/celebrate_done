import { ManipulateType } from 'dayjs'
import { TodoRepeatFrequency } from '@prisma/client'

type RepeatDayUnitsToSqlUnits = {
  [key in TodoRepeatFrequency]: {
    unit: ManipulateType
    count: number
  }
}
export const repeatDayUnitsToSqlUnits: RepeatDayUnitsToSqlUnits = {
  [TodoRepeatFrequency.DAILY]: {
    unit: 'day',
    count: 1,
  },
  [TodoRepeatFrequency.WEEKLY]: {
    unit: 'week',
    count: 1,
  },
  [TodoRepeatFrequency.FORTNIGHTLY]: {
    unit: 'week',
    count: 2,
  },
  [TodoRepeatFrequency.MONTHLY]: {
    unit: 'month',
    count: 1,
  },
  [TodoRepeatFrequency.ANNUALLY]: {
    unit: 'year',
    count: 1,
  },
}
