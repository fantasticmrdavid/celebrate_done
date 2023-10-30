import React, { createContext, ReactNode, FC, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CategoryWithRelations } from '@/pages/api/categories/getCategories'
import { SelectedDateContext } from '@/app/contexts/SelectedDate'
import { getSortedTodoList } from '@/pages/api/utils'
import { getLocalEndOfDay, getLocalStartOfDay } from '@/app/utils'
import { LoadingSpinner } from '@/app/components/LoadingSpinner/LoadingSpinner'

export interface CategoriesContextValues {
  categoryList: CategoryWithRelations[]
  isFetchingCategories: boolean
  isFetchingCategoriesError: boolean
}

interface CategoriesContextProps {
  children: ReactNode
}

const CategoriesContextInitialValues = {
  categoryList: [],
  isFetchingCategories: false,
  isFetchingCategoriesError: false,
}

export const CategoriesContext = createContext<CategoriesContextValues>(
  CategoriesContextInitialValues,
)

export const CategoriesProvider: FC<CategoriesContextProps> = ({
  children,
}) => {
  const { currentDate } = useContext(SelectedDateContext)
  const { isLoading, error, data } = useQuery({
    queryKey: ['getCategories', currentDate],
    queryFn: async () =>
      await fetch(
        `/api/categories?localStartOfDay=${getLocalStartOfDay(
          currentDate,
        )}&localEndOfDay=${getLocalEndOfDay(currentDate)}`,
      ).then((res) => res.json()),
  })

  if (isLoading || !data) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <CategoriesContext.Provider
      value={{
        categoryList: data.map((c: CategoryWithRelations) => ({
          ...c,
          todos: getSortedTodoList(c.todos),
        })),
        isFetchingCategories: isLoading,
        isFetchingCategoriesError: !!error,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}
