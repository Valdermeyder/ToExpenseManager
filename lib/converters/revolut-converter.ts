import { parse } from 'csv-parse/sync'
import moment from 'moment'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { sanitize } from '@/lib/utils'

const columns = ['type', 'product', 'date', 'realDate', 'description', 'amount', 'fee', 'currency', 'balance']

const parseAmount = (amount: string) => parseFloat(amount.replace(' ', '').replace(',', '.'))

const parseDescription = (description: string) => {
  const descriptionParts = description.split(',')
  if (descriptionParts.length === 1) {
    return descriptionParts[0]
  }
  const payerPart = descriptionParts[1]
  return payerPart.replace('w ', '').replace(/\d+ PLN/, '').trim()
}

const getExpenseManagerRecord = (recordCategoryResolver: (payer: string, amount: number) => any) => (record: any) => {
  const payer = parseDescription(record[columns[4]])
  const currency = record[columns[6]] === 'PLN' ? '' : ' ' + record[columns[7]]
  const amount = parseAmount(record[columns[5]])
  const { category, subCategory } = recordCategoryResolver(payer, amount)
  return (
    moment(record[columns[2]]).format('DD.MM.YYYY') +
    ',' +
    amount +
    ',' +
    category +
    ',' +
    subCategory +
    ',Credit Card,,,' +
    sanitize(payer) +
    ',,,Revolut' +
    currency +
    '\n'
  )
}

export function convertRevolut(input: Buffer, categoriesMapping?: CategoriesMapping): string {
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
    .slice(1)
    .filter(
      (record: any) =>
        record[columns[4]] !== 'Depositing savings' && record[columns[4]] !== 'Withdrawing savings'
    )
    .map((record: any) => getExpenseManagerWithMapping(record))
    .join('')
}
