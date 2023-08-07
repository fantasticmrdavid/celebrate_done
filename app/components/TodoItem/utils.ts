import { ManipulateType } from 'dayjs'

export enum TODO_SIZE {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export enum TODO_PRIORITY {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
}

export enum TODO_STATUS {
  INCOMPLETE = 'INCOMPLETE',
  DONE = 'DONE',
}

export enum TODO_REPEAT_FREQUENCY {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
}

type RepeatDayUnitsToSqlUnits = {
  [key in TODO_REPEAT_FREQUENCY]: {
    unit: ManipulateType
    count: number
  }
}
export const repeatDayUnitsToSqlUnits: RepeatDayUnitsToSqlUnits = {
  [TODO_REPEAT_FREQUENCY.DAILY]: {
    unit: 'day',
    count: 1,
  },
  [TODO_REPEAT_FREQUENCY.WEEKLY]: {
    unit: 'week',
    count: 1,
  },
  [TODO_REPEAT_FREQUENCY.FORTNIGHTLY]: {
    unit: 'week',
    count: 2,
  },
  [TODO_REPEAT_FREQUENCY.MONTHLY]: {
    unit: 'month',
    count: 1,
  },
  [TODO_REPEAT_FREQUENCY.ANNUALLY]: {
    unit: 'year',
    count: 1,
  },
}
