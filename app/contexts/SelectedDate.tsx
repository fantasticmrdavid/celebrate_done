import React, { createContext, ReactNode, FC, useState } from 'react'
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
