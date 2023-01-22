const { parse } = require('csv-parse/sync')
const { transform } = require('stream-transform')
const moment = require('moment')
const categoryResolver = require('../categoryResolver')
const { sanitize } = require('../utils')

const columns = ["Data operacji", "Data waluty", "Typ transakcji", "Kwota", "Waluta", "Saldo po transakcji", "Opis transakcji", "Adres"]

const parseAmount = amount => parseFloat(amount)

const adresPayerIdentificator = 'Adres: ';
const namePayerIdentificator = 'Nazwa nadawcy: ';

function calculatePayerStartIndex(payer) {
	if (payer.includes(adresPayerIdentificator)) {
		return payer.indexOf(adresPayerIdentificator) + adresPayerIdentificator.length
	}
	if (payer.includes(namePayerIdentificator)) {
		return payer.indexOf(namePayerIdentificator) + namePayerIdentificator.length
	}
	return 0;
}

const parsePayer = payer => payer && payer.slice(calculatePayerStartIndex(payer))

const getPayerByTransaction = transactionType => {
	switch (transactionType) {
		case 'Op�ata za u�ytkowanie karty':
		case 'Prowizja':
			return 'Bank'
		case 'Naliczenie odsetek':
			return 'Deposit'
		default:
			return ''
	}
}

const getExpenseManagerRecord = recordCategoryResolver => record => {
	const transactionType = record[columns[2]];
	const amount = parseAmount(record[columns[3]]);
	const payer = parsePayer(record[columns[7]]) || getPayerByTransaction(transactionType);
	const { category, subCategory } = recordCategoryResolver(payer, amount);
	return moment(record[columns[1]], 'YYYY-MM-DD').format('DD.MM.YYYY') + ','
		+ amount + ',' + category + ',' + subCategory
		+ ',Credit Card,,,' + sanitize(payer)
		+ ',,,PKO\n'
}

exports.convertCvsFileData = (input, categoriesMapping) => {
	const getExpenseManagerWithMapping = getExpenseManagerRecord(categoryResolver.resolveCategory(categoriesMapping))
	return transform(parse(input, { delimiter: ',', columns, relax_column_count: true }).slice(1).filter(record => record),
		record => getExpenseManagerWithMapping(record))
}
