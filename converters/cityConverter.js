const { parse } = require('csv-parse/sync')
const { transform } = require('stream-transform')
const moment = require('moment')
const categoryResolver = require('../categoryResolver')
const { sanitize } = require('../utils')

const columns = ['date', 'description', 'amount', 'balance', 'magicNumber', 'type']

const parseAmount = amount => parseFloat(amount.replace('.', '').replace(',', '.'))

const parsePayer = payer => (payer && payer.split('  ')[0].trim())

const getPayerByTransaction = transactionType => {
	switch (transactionType) {
		case 'ODSETKI - LOKATA TERMINOWA':
			return 'Deposit'
	}
}

function shouldBeFilteredOut(payer, transactionType) {
	return payer.startsWith('SPŁATA') || transactionType === 'SPŁATA KARTY KREDYTOWEJ' || transactionType === 'CREDIT CARD REPAYMENT' || transactionType === 'CITIBANK MASTERCARD PAYMENT'
}

function findCurrencyInDescription(description) {
	if (description.includes('EUR')) {
		return 'EUR'
	}
	return 'PLN'
}

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const transactionType = record[columns[5]]
	const description = record[columns[1]]
	const currency = findCurrencyInDescription(description)
	const payer = getPayerByTransaction(transactionType) || parsePayer(description);
	if (shouldBeFilteredOut(payer, transactionType)) {
		return null;
	}
	const amount = parseAmount(record[columns[2]])
	const { category, subCategory } = recordCategoryResolver(payer, amount);
	return moment(record[columns[0]], 'DD/MM/YYYY').format('DD.MM.YYYY') + ','
		+ amount + ',' + category + ',' + subCategory
		+ ',Credit Card,,,' + sanitize(payer)
		+ ',,,Citi ' + currency + '\n'
}

exports.convertCvsFileData = (input, categoriesMapping) => {
	const getExpenseManagerWithMapping = getExpenseManagerRecord(categoryResolver.resolveCategory(categoriesMapping))
	return transform(parse(input, { delimiter: ',', columns, relax: true, relax_column_count: true, bom: true }),
		record => getExpenseManagerWithMapping(record))
}
