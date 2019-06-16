const parseSync = require('csv-parse/lib/sync')
const transform = require('stream-transform')
const moment = require('moment')
const categoryResolver = require('../categoryResolver')

const payerFilter = /\s+\w+\s+\w+$/i
const columns = ['date', 'description', 'amount']

const parseAmount = amount => parseFloat(amount.replace('.', '').replace(',', '.'))

const parsePayer = payer => (payer && payer.replace(payerFilter, '').replace(',', ''))

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const payer = parsePayer(record[columns[1]]);
	const { category, subCategory } = recordCategoryResolver(payer);
	return moment(record[columns[0]], 'DD/MM/YYYY').format('DD.MM.YYYY') + ','
		+ parseAmount(record[columns[2]]) + ',' + category + ',' + subCategory
		+ ',Credit Card,,,' + payer
		+ ',,,CitiBank\n'
}

exports.convertCvsFileData = (input, categoriesMapping) => {
	const getExpenseManagerWithMapping = getExpenseManagerRecord(categoryResolver.resolveCategory(categoriesMapping))
	return transform(parseSync(input, { delimiter: ',', columns, relax_column_count: true }),
		record => getExpenseManagerWithMapping(record))
}
