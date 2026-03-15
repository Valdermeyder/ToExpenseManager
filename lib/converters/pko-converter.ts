import { parse } from 'csv-parse/sync'
import moment from 'moment'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { sanitize } from '@/lib/utils'

const columns = ['Data operacji', 'Data waluty', 'Typ transakcji', 'Kwota', 'Waluta', 'Saldo po transakcji', 'Opis transakcji', 'Adres']

const parseAmount = (amount: string) => parseFloat(amount)

const adresPayerIdentificator = 'Adres: '
const namePayerIdentificator = 'Nazwa nadawcy: '

function calculatePayerStartIndex(payer: string) {
  if (payer.includes(adresPayerIdentificator)) {
    return payer.indexOf(adresPayerIdentificator) + adresPayerIdentificator.length
  }
  if (payer.includes(namePayerIdentificator)) {
    return payer.indexOf(namePayerIdentificator) + namePayerIdentificator.length
  }
  return 0
}

const parsePayer = (payer: string) => payer && payer.slice(calculatePayerStartIndex(payer))

const getPayerByTransaction = (transactionType: string) => {
  switch (transactionType) {
    case 'Opłata za użytkowanie karty':
    case 'Prowizja':
      return 'Bank'
    case 'Naliczenie odsetek':
      return 'Deposit'
    default:
      return ''
  }
}

const getExpenseManagerRecord = (recordCategoryResolver: (payer: string, amount: number) => any) => (record: any) => {
  const transactionType = record[columns[2]]
  const amount = parseAmount(record[columns[3]])
  const payer = parsePayer(record[columns[7]]) || getPayerByTransaction(transactionType)
  const { category, subCategory } = recordCategoryResolver(payer, amount)
  return (
    moment(record[columns[1]], 'YYYY-MM-DD').format('DD.MM.YYYY') +
    ',' +
    amount +
    ',' +
    category +
    ',' +
    subCategory +
    ',Credit Card,,,' +
    sanitize(payer) +
    ',,,PKO\n'
  )
}

export function convertPko(input: Buffer, categoriesMapping?: CategoriesMapping): string {
  const records = parse(input, {
    delimiter: ',',
    columns,
    relax_column_count: true,
  })

  const resolver = resolveCategory(categoriesMapping || {})
  const getExpenseManagerWithMapping = getExpenseManagerRecord(resolver)

  return records
    .slice(1)
    .filter((record: any) => record)
    .map((record: any) => getExpenseManagerWithMapping(record))
    .join('')
}
