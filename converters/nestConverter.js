const { parse } = require('csv-parse/sync')
const { transform } = require('stream-transform')
const moment = require('moment')
const categoryResolver = require('../categoryResolver')
const { sanitize } = require('../utils')

const columns = ['Data księgowania', 'Data operacji', 'Rodzaj operacji', 'Kwota', 'Waluta', 'Dane kontrahenta', 'Numer rachunku kontrahenta',
	'Tytuł operacji', 'Saldo po operacji']

const parseAmount = amount => parseFloat(amount)

const extractPayer = (payerString) => payerString ? payerString.split('|')[0] : ''
const parsePayer = (payerFromTitle, payer) => extractPayer(payer || payerFromTitle)

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const amount = parseAmount(record[columns[3]]);
	const description = record[columns[7]]
	const payer = parsePayer(description, record[columns[5]]);
	const { category, subCategory } = recordCategoryResolver(payer, amount);
	return moment(record[columns[1]], 'DD-MM-YYYY').format('DD.MM.YYYY') + ','
		+ amount + ',' + category + ',' + subCategory
		+ ',Credit Card,' + sanitize(description) + ',,' + sanitize(payer)
		+ ',,,Nest\n'
}

exports.convertCvsFileData = (input, categoriesMapping) => {
	const getExpenseManagerWithMapping = getExpenseManagerRecord(categoryResolver.resolveCategory(categoriesMapping))
	return transform(parse(input, { delimiter: ',', columns, relax_column_count: true }).slice(7).filter(record => record),
		record => getExpenseManagerWithMapping(record))
}
