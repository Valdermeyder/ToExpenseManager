import { parse } from 'csv-parse/sync'
import moment from 'moment'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { sanitize } from '@/lib/utils'

const columns = ['Data księgowania', 'Data operacji', 'Rodzaj operacji', 'Kwota', 'Waluta', 'Dane kontrahenta', 'Numer rachunku kontrahenta', 'Tytuł operacji', 'Saldo po operacji']

const parseAmount = (amount: string) => parseFloat(amount)

const extractPayer = (payerString: string) => (payerString ? payerString.split('|')[0] : '')
const parsePayer = (payerFromTitle: string, payer: string) => extractPayer(payer || payerFromTitle)

const getExpenseManagerRecord = (recordCategoryResolver: (payer: string, amount: number) => any) => (record: any) => {
  const amount = parseAmount(record[columns[3]])
  const description = record[columns[7]]
  const payer = parsePayer(description, record[columns[5]])
  const { category, subCategory } = recordCategoryResolver(payer, amount)
  return (
    moment(record[columns[1]], 'DD-MM-YYYY').format('DD.MM.YYYY') +
    ',' +
    amount +
    ',' +
    category +
    ',' +
    subCategory +
    ',Credit Card,' +
    sanitize(description) +
    ',,' +
    sanitize(payer) +
    ',,,Nest\n'
  )
}

export function convertNest(input: Buffer, categoriesMapping?: CategoriesMapping): string {
  const records = parse(input, {
    delimiter: ',',
    columns,
    relax_column_count: true,
  })

  const resolver = resolveCategory(categoriesMapping || {})
  const getExpenseManagerWithMapping = getExpenseManagerRecord(resolver)

  return records
    .slice(7)
    .filter((record: any) => record)
    .map((record: any) => getExpenseManagerWithMapping(record))
    .join('')
}
