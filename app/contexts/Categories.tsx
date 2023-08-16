import React, { createContext, ReactNode, FC, useContext } from 'react'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import { useSession } from 'next-auth/react'
import { CategoryWithRelations } from '@/pages/api/categories/getCategories'
import { SelectedDateContext } from '@/app/contexts/SelectedDate'
import { dateIsoToSql, getSortedTodoList } from '@/pages/api/utils'
import { getLocalEndOfDay, getLocalStartOfDay } from '@/app/utils'

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
  const { data: session } = useSession()
  const { isLoading, error, data } = useQuery(
    ['getCategories', currentDate] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/categories?userId=${
          session?.user?.id || ''
        }&localStartOfDay=${getLocalStartOfDay(
          currentDate,
        )}&localEndOfDay=${getLocalEndOfDay(currentDate)}`,
      ).then((res) => res.json()),
    {
      initialData: [],
    },
  )

  if (isLoading || !data) {
    return (
      <div>
        <Spin size="large" />
        <div className="content">Loading categories</div>
      </div>
    )
  }

  console.log('CATEGORIES: ', data)

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
