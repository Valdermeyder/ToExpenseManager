const { parse } = require('csv-parse/sync')
const { transform } = require('stream-transform')
const categoryResolver = require('../categoryResolver')
const { sanitize } = require('../utils')

const columns = ['date', 'realDate', 'description', 'amount', 'balance']

const parseAmount = amount => parseFloat(amount.replace(' ', '').replace(',', '.'))

const parseDescription = description => {
	const descriptionParts = description.split(',')
	if (descriptionParts.length === 1) {
		return descriptionParts[0]
	}
	const payerPart = descriptionParts[1]
	return payerPart.replace('w ', '').replace(/\d+ PLN/, '').trim()
}

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const payer = parseDescription(record[columns[2]]);
	const amount = parseAmount(record[columns[3]])
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
