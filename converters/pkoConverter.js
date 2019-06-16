const parseSync = require('csv-parse/lib/sync')
const transform = require('stream-transform')
const moment = require('moment')
const categoryResolver = require('../categoryResolver')

const columns = ["Data operacji","Data waluty","Typ transakcji","Kwota","Waluta","Saldo po transakcji","Opis transakcji","Adres"]

const parseAmount = amount => parseFloat(amount)

const payerIdentificator = 'Adres: ';
const parsePayer = payer => payer && payer.slice(payer.indexOf(payerIdentificator) + payerIdentificator.length)

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const payer = parsePayer(record[columns[7]]);
	const { category, subCategory } = recordCategoryResolver(payer);
	return moment(record[columns[1]], 'YYYY-MM-DD').format('DD.MM.YYYY') + ','
		+ parseAmount(record[columns[3]]) + ',' + category + ',' + subCategory
		+ ',Credit Card,,,' + payer
		+ ',,,PKO\n'
}

exports.convertCvsFileData = (input, categoriesMapping) => {
	const getExpenseManagerWithMapping = getExpenseManagerRecord(categoryResolver.resolveCategory(categoriesMapping))
	return transform(parseSync(input, { delimiter: ',', columns, relax_column_count: true }).slice(1),
		record => getExpenseManagerWithMapping(record))
}
