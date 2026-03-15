import { parse } from 'csv-parse/sync'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { sanitize } from '@/lib/utils'

const columns = [
  'Date and time',
  'Description',
  'MCC',
  'Card currency amount, (UAH)',
  'Operation amount',
  'Operation currency',
  'Exchange rate',
  'Commission, (UAH)',
  'Cashback amount, (UAH)',
  'Balance',
]

const parseAmount = (amount: string) => parseFloat(amount)

const getExpenseManagerRecord = (recordCategoryResolver: (payer: string, amount: number) => any) => (record: any) => {
  const amount = parseAmount(record[columns[3]])
  const payer = record[columns[1]]
  const { category, subCategory } = recordCategoryResolver(payer, amount)
  return (
    record[columns[0]].split(' ')[0] +
    ',' +
    amount +
    ',' +
    category +
    ',' +
    subCategory +
    ',Credit Card,,,' +
    sanitize(payer) +
    ',,,Monobank\n'
  )
}

export function convertMonobank(input: Buffer, categoriesMapping?: CategoriesMapping): string {
  const records = parse(input, {
    delimiter: ',',
    columns,
    relax_column_count: true,
    relax: true,
  })

  const resolver = resolveCategory(categoriesMapping || {})
  const getExpenseManagerWithMapping = getExpenseManagerRecord(resolver)

  return records
    .slice(1)
    .filter((record: any) => record)
    .map((record: any) => getExpenseManagerWithMapping(record))
    .join('')
}
