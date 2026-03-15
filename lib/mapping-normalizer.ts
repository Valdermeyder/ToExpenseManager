import type { CategoriesMapping } from './category-resolver'

interface CategoryConfig {
  [subCategory: string]: string[]
}

interface CategoriesConfig {
  [category: string]: CategoryConfig
}

export function normalizeCategories(categories: CategoriesConfig | undefined | null): CategoriesMapping {
  if (!categories) return {}
  
  return Object.keys(categories).reduce((payerByCategory, categoryKey) => {
    const category = categories[categoryKey]
    return Object.keys(category).reduce((subCategoriesWithPayers, subCategoryKey) => {
      const payers = category[subCategoryKey] || []
      if (!Array.isArray(payers)) {
        throw new Error(`Payers for "${subCategoryKey}" is not an array`)
      }
      return payers.reduce(
        (payersWithSubCategory, payer) => ({
          ...payersWithSubCategory,
          [payer]: { category: categoryKey, subCategory: subCategoryKey }
        }),
        subCategoriesWithPayers
      )
    }, payerByCategory)
  }, {} as CategoriesMapping)
}
