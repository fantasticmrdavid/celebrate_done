import React, { createContext, ReactNode, FC, useContext } from 'react'
import { Category } from '@/app/components/CategoryFormModal/types'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import { UserContext } from '@/app/contexts/User'

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
  const { user } = useContext(UserContext)
  const { isLoading, error, data } = useQuery(
    ['getCategories'] as unknown as QueryKey,
    async () =>
      await fetch(`/api/categories?user_id=${user?.uuid || ''}`).then((res) =>
        res.json()
      ),
    {
      initialData: [],
    }
  )

  if (isLoading || !data) {
    return (
      <Spin tip="Loading categories" size="large">
        <div className="content" />
      </Spin>
    )
  }

  const categoriesList: Category[] = data.map((c: Category) => ({
    uuid: c.uuid,
    name: c.name,
    description: c.description,
    maxPerDay: c.maxPerDay,
    sortOrder: c.sortOrder,
    user_id: c.user_id
  }))

  return (
    <CategoriesContext.Provider
      value={{
        categoryList: categoriesList,
        isFetchingCategories: isLoading,
        isFetchingCategoriesError: !!error,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}
