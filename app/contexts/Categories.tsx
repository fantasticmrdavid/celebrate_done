import React, { createContext, ReactNode, FC } from 'react'
import { Category } from '@/app/components/CategoryFormModal/types'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import { useSession } from 'next-auth/react'

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
  CategoriesContextInitialValues,
)

export const CategoriesProvider: FC<CategoriesContextProps> = ({
  children,
}) => {
  const { data: session } = useSession()
  const { isLoading, error, data } = useQuery(
    ['getCategories'] as unknown as QueryKey,
    async () =>
      await fetch(`/api/categories?user_id=${session?.user?.id || ''}`).then(
        (res) => res.json(),
      ),
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

  const categoriesList: Category[] = data.map((c: Category) => ({
    uuid: c.uuid,
    name: c.name,
    description: c.description,
    color: c.color,
    maxPerDay: c.maxPerDay,
    sortOrder: c.sortOrder,
    user_id: c.user_id,
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
