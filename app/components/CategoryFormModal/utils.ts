import { Category } from '@/app/components/CategoryFormModal/types'

export type CategoryValidation = {
  [key: string]: string
}

export const validateCategory = (
  t: Pick<Category, 'name'>
): CategoryValidation => {
  let validation = {}
  if (t.name.length === 0) {
    validation = {
      ...validation,
      name: 'Please specify a name for the category',
    }
  }

  return validation
}
