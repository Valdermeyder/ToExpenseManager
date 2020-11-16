const parseSync = require('csv-parse/lib/sync')
const transform = require('stream-transform')
const moment = require('moment')
const categoryResolver = require('../categoryResolver')
const { sanitizePayer } = require('../payerUtils')

const columns = ['Data księgowania', 'Data operacji', 'Rodzaj operacji', 'Kwota', 'Waluta', 'Dane kontrahenta', 'Numer rachunku kontrahenta',
	'Tytuł operacji', 'Saldo po operacji']

const parseAmount = amount => parseFloat(amount)

const payerIdentificator = '|Nr karty ...';
const cardNumberLength = 5;
const extractPayer = (payerString) => payerString ? payerString.split('|')[0] : ''
const parsePayer = (payerFromTitle, payer) => extractPayer(payer || payerFromTitle)

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const amount = parseAmount(record[columns[3]]);
	const description = record[columns[7]]
	const payer = parsePayer(description, record[columns[5]]);
	const { category, subCategory } = recordCategoryResolver(payer, amount);
	return moment(record[columns[1]], 'DD-MM-YYYY').format('DD.MM.YYYY') + ','
		+ amount + ',' + category + ',' + subCategory
		+ ',Credit Card,"' + description + '",,' + sanitizePayer(payer)
		+ ',,,Nest\n'
}

exports.convertCvsFileData = (input, categoriesMapping) => {
	const getExpenseManagerWithMapping = getExpenseManagerRecord(categoryResolver.resolveCategory(categoriesMapping))
	return transform(parseSync(input, { delimiter: ',', columns, relax_column_count: true }).slice(7).filter(record => record),
		record => getExpenseManagerWithMapping(record))
}
