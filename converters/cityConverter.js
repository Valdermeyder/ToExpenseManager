const parseSync = require('csv-parse/lib/sync')
const transform = require('stream-transform')
const moment = require('moment')
const categoryResolver = require('../categoryResolver')
const { sanitize } = require('../utils')

const payerFilter = /\s+\w+\s+\w+$/i
const columns = ['date', 'description', 'amount', 'balance', 'magicNumber', 'type']

const parseAmount = amount => parseFloat(amount.replace('.', '').replace(',', '.'))

const parsePayer = payer => (payer && payer.replace(payerFilter, '').replace(',', ''))

const getPayerByTransaction = transactionType => {
	switch (transactionType) {
		case 'ODSETKI - LOKATA TERMINOWA':
			return 'Deposit'
	}
}

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const transactionType = record[columns[5]]
	const payer = getPayerByTransaction(transactionType) || parsePayer(record[columns[1]]);
	if (payer.startsWith('SPŁATA') || transactionType === 'SPŁATA KARTY KREDYTOWEJ') {
		return null;
	}
	const amount = parseAmount(record[columns[2]])
	const { category, subCategory } = recordCategoryResolver(payer, amount);
	return moment(record[columns[0]], 'DD/MM/YYYY').format('DD.MM.YYYY') + ','
		+ amount + ',' + category + ',' + subCategory
		+ ',Credit Card,,,' + sanitize(payer)
		+ ',,,CitiBank\n'
}

exports.convertCvsFileData = (input, categoriesMapping) => {
	const getExpenseManagerWithMapping = getExpenseManagerRecord(categoryResolver.resolveCategory(categoriesMapping))
	return transform(parseSync(input, { delimiter: ',', columns, relax: true, relax_column_count: true }),
		record => getExpenseManagerWithMapping(record))
}
