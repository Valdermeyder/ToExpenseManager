export interface CategoryMapping {
  category: string
  subCategory: string
}

export type CategoriesMapping = Record<string, CategoryMapping>

const payerIncludesCategory = (payer: string) => (payerFromCfg: string) => 
  new RegExp(payerFromCfg, 'i').test(payer)

const getCategoryConf = (payer: string, categoriesMapping: CategoriesMapping = {}): CategoryMapping | undefined => 
  categoriesMapping[payer] || 
  categoriesMapping[
    Object.keys(categoriesMapping).find(payerIncludesCategory(payer)) || ''
  ]

export function resolveCategory(categoriesMapping: CategoriesMapping) {
  return (payer: string, amount?: number): CategoryMapping => {
    const fullCategory = getCategoryConf(payer, categoriesMapping) || { category: '', subCategory: '' }
    if (amount && amount > 0 && fullCategory.category !== 'Income') {
      return { category: 'Income', subCategory: '' }
    }
    return fullCategory
  }
}
