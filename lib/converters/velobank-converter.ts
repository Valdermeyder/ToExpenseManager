import { parse } from 'csv-parse/sync'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { sanitize } from '@/lib/utils'

const columns = ['date', 'realDate', 'description', 'amount', 'balance']

const parseAmount = (amount: string) => parseFloat(amount.replace(' ', '').replace(',', '.'))

const parseDescription = (description: string) => {
  const titleMatch = description.match(/Tytu\?:\s*([^\n\r]+)/i)
  if (titleMatch) {
    return titleMatch[1].trim()
  }
  const descriptionParts = description.split(',')
  if (descriptionParts.length === 1) {
    return descriptionParts[0]
  }
  const numberOfCartParts = (description.match(/Operacja kart/gi) || []).length
  const payerPart = descriptionParts[numberOfCartParts]
  return payerPart.replace('w ', '').replace(/\d+ PLN/, '').trim()
}

const getExpenseManagerRecord = (recordCategoryResolver: (payer: string, amount: number) => any) => (record: any) => {
  const payer = parseDescription(record[columns[2]])
  const amount = parseAmount(record[columns[3]])
  const { category, subCategory } = recordCategoryResolver(payer, amount)
  return record[columns[0]] + ',' + amount + ',' + category + ',' + subCategory + ',Credit Card,,,' + sanitize(payer) + ',,,GetIn\n'
}

export function convertVelobank(input: Buffer, categoriesMapping?: CategoriesMapping): string {
  const records = parse(input, {
    delimiter: ',',
    columns,
    relax: true,
    relax_column_count: true,
    bom: true,
  })

  const resolver = resolveCategory(categoriesMapping || {})
  const getExpenseManagerWithMapping = getExpenseManagerRecord(resolver)

  return records
    .map((record: any) => getExpenseManagerWithMapping(record))
    .filter((record: any) => record !== null)
    .join('')
}
