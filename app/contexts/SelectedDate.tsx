import React, { createContext, ReactNode, FC, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { isValidDate } from '@/app/utils'
export interface SelectedDateContextValues {
  currentDate: string
  setCurrentDate: (d: string) => void
}

interface SelectedDateContextProps {
  children: ReactNode
}

const SelectedDateContextInitialValues = {
  currentDate: new Date().toISOString(),
  setCurrentDate: () => {},
}

export const SelectedDateContext = createContext<SelectedDateContextValues>(
  SelectedDateContextInitialValues,
)

export const SelectedDateProvider: FC<SelectedDateContextProps> = ({
  children,
}) => {
  const [currentDate, setCurrentDate] = useState<string>(
    SelectedDateContextInitialValues.currentDate,
  )
  const searchParams = useSearchParams()
  const searchParamDate = searchParams?.get('date')
  useEffect(() => {
    if (searchParamDate && isValidDate(searchParamDate)) {
      setCurrentDate(searchParamDate)
    } else {
      setCurrentDate(SelectedDateContextInitialValues.currentDate)
    }
  }, [searchParamDate, currentDate])

  return (
    <SelectedDateContext.Provider
      value={{
        currentDate,
        setCurrentDate,
      }}
    >
      {children}
    </SelectedDateContext.Provider>
  )
}
