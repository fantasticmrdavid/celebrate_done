import React, { createContext, ReactNode, FC } from 'react'
import { Category } from '@/app/components/CategoryFormModal/types'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'

export interface CategoriesContextValues {
  categoryList: Category[]
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
  CategoriesContextInitialValues
)

export const CategoriesProvider: FC<CategoriesContextProps> = ({
  children,
}) => {
  const { isLoading, error, data } = useQuery(
    ['getCategories'] as unknown as QueryKey,
    async () => await fetch('/api/categories').then((res) => res.json()),
    {
      initialData: [],
    }
  )

  const categoriesList: Category[] = data.map((c: any) => ({
    id: c.id,
    uuid: c.uuid,
    name: c.name,
    description: c.description,
    maxPerDay: c.maxPerDay,
    sortOrder: c.sortOrder,
  }))

  return (
    <CategoriesContext.Provider
      value={{
        categoryList: categoriesList,
        isFetchingCategories: isLoading,
        isFetchingCategoriesError: !!error,
      }}
    >
      {isLoading && (
        <Spin tip="Loading categories" size="large">
          <div className="content" />
        </Spin>
      )}
      {children}
    </CategoriesContext.Provider>
  )
}
