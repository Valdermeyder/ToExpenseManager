import { parse } from 'csv-parse/sync'
import moment from 'moment'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { sanitize } from '@/lib/utils'

const columns = ['operationDate', 'payDate', 'description', 'payer', 'payerAccount', 'amount', 'empty', 'index']

const parseAmount = (amount: string) => parseFloat(amount.replace(',', '.'))

function extractCurrency(description: string) {
  const currencyMatch = description.match(/\b(\d+\.\d+)\s+([A-Z]{3})\b/)
  return currencyMatch ? currencyMatch[2] : 'PLN'
}

function normalisePayer(description: string) {
  const currency = extractCurrency(description)
  if (currency === 'PLN') {
    return description.replace(/^.*PLN /, '')
  }
  const match = description.match(/\d+\.\d+\s+[A-Z]{3}\s+(.+)$/)
  if (match) {
    let merchantName = match[1]
    merchantName = merchantName.replace(/\s+[A-Z]{3}\s+.*$/, '')
    return merchantName.trim()
  }
  return description
}

const BANK_NAME = 'Santander'

function descriptionToPayer(description: string) {
  if (description.startsWith('Suma nagród za płatności')) {
    return BANK_NAME
  }
  if (description.includes('Opłata za prowadzenie rachunku')) {
    return BANK_NAME
  }
  return normalisePayer(description)
}

function parsePayer(payer: string, description: string) {
  return payer || descriptionToPayer(description)
}

const getExpenseManagerRecord = (recordCategoryResolver: (payer: string, amount: number) => any) => (record: any) => {
  const amount = parseAmount(record[columns[5]])
  const payer = parsePayer(record[columns[3]], record[columns[2]])
  const currency = extractCurrency(record[columns[2]])
  const currencySuffix = currency !== 'PLN' ? ' ' + currency : ''
  const originalDescription = sanitize(record[columns[2]])
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
    originalDescription +
    ',,' +
    sanitize(payer) +
    ',,,' +
    BANK_NAME +
    currencySuffix +
    '\n'
  )
}

export function convertSantander(input: Buffer, categoriesMapping?: CategoriesMapping): string {
  const records = parse(input, {
    delimiter: ',',
    columns,
    relax_column_count: true,
    relax: true,
    relax_quotes: true,
  })

  const resolver = resolveCategory(categoriesMapping || {})
  const getExpenseManagerWithMapping = getExpenseManagerRecord(resolver)

  return records
    .slice(1)
    .filter((record: any) => record)
    .map((record: any) => getExpenseManagerWithMapping(record))
    .join('')
}
