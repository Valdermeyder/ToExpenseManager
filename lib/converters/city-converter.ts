import { parse } from 'csv-parse/sync'
import moment from 'moment'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { sanitize } from '@/lib/utils'

const columns = ['date', 'description', 'amount', 'balance', 'magicNumber', 'type']

const parseAmount = (amount: string) => parseFloat(amount.replace('.', '').replace(',', '.'))

const parsePayer = (payer: string) => payer && payer.split('  ')[0].trim()

const getPayerByTransaction = (transactionType: string) => {
  switch (transactionType) {
    case 'ODSETKI - LOKATA TERMINOWA':
      return 'Deposit'
  }
}

function shouldBeFilteredOut(payer: string, transactionType: string) {
  return (
    payer.startsWith('SPŁATA') ||
    transactionType === 'SPŁATA KARTY KREDYTOWEJ' ||
    transactionType === 'CREDIT CARD REPAYMENT' ||
    transactionType === 'CITIBANK MASTERCARD PAYMENT'
  )
}

function findCurrencyInDescription(description: string) {
  if (description.includes('EUR')) {
    return 'EUR'
  }
  return 'PLN'
}

const getExpenseManagerRecord = (recordCategoryResolver: (payer: string, amount: number) => any) => (record: any) => {
  const transactionType = record[columns[5]]
  const description = record[columns[1]]
  const currency = findCurrencyInDescription(description)
  const payer = getPayerByTransaction(transactionType) || parsePayer(description)
  if (shouldBeFilteredOut(payer, transactionType)) {
    return null
  }
  const amount = parseAmount(record[columns[2]])
  const { category, subCategory } = recordCategoryResolver(payer, amount)
  return (
    moment(record[columns[0]], 'DD/MM/YYYY').format('DD.MM.YYYY') +
    ',' +
    amount +
    ',' +
    category +
    ',' +
    subCategory +
    ',Credit Card,,,' +
    sanitize(payer) +
    ',,,Citi ' +
    currency +
    '\n'
  )
}

export function convertCity(input: Buffer, categoriesMapping?: CategoriesMapping): string {
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
