const { parse } = require('csv-parse/sync')
const { transform } = require('stream-transform')
const categoryResolver = require('../categoryResolver')
const { sanitize } = require('../utils')

const columns = ['date', 'realDate', 'description', 'payer', 'amount', 'balance']

const parseAmount = amount => parseFloat(amount.replace(' ', '').replace(/w/, '').replace(',', '.'))

const parsePayer = payer => {
	const payerWithoutLocation = payer.split(',')[0]
	return payerWithoutLocation.replace('w ', '').trim()
}

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const payer = parsePayer(record[columns[3]]);
	const amount = parseAmount(record[columns[4]])
	const { category, subCategory } = recordCategoryResolver(payer, amount);
	return record[columns[0]] + ','
		+ amount + ',' + category + ',' + subCategory
		+ ',Credit Card,,,' + sanitize(payer)
		+ ',,,GetIn\n'
}

exports.convertCvsFileData = (input, categoriesMapping) => {
	const getExpenseManagerWithMapping = getExpenseManagerRecord(categoryResolver.resolveCategory(categoriesMapping))
	return transform(parse(input, { delimiter: ',', columns, relax: true, relax_column_count: true, bom: true }),
		record => getExpenseManagerWithMapping(record))
}
