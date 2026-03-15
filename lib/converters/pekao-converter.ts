import { parse } from 'csv-parse/sync'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { sanitize } from '@/lib/utils'

const columns = ['operationDate', 'payDate', 'payer', 'payerAddress', 'accountSrc', 'accountDst', 'description', 'amount']

const parseAmount = (amount: string) => parseFloat(amount.replace(',', '.').replace(' ', ''))

function descriptionToPayer(description: string) {
  if (description.startsWith('POBRANIE ZALEGŁEJ OPŁATY')) {
    return 'Bank Commission'
  }
  return description
}

function parsePayer(payer: string, description: string) {
  return payer || descriptionToPayer(description)
}

const getExpenseManagerRecord = (recordCategoryResolver: (payer: string, amount: number) => any) => (record: any) => {
  const amount = parseAmount(record[columns[7]])
  const payer = parsePayer(record[columns[2]], record[columns[6]])
  const { category, subCategory } = recordCategoryResolver(payer, amount)
  return (
    record[columns[1]] +
    ',' +
    amount +
    ',' +
    category +
    ',' +
    subCategory +
    ',Credit Card,,,' +
    sanitize(payer) +
    ',,,Pekao\n'
  )
}

export function convertPekao(input: Buffer, categoriesMapping?: CategoriesMapping): string {
  const records = parse(input, {
    delimiter: ';',
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
