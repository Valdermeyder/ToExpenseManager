const fs = require('fs')
const csv = require('csv')
const moment = require('moment')
const categoryResolver = require('./categoryResolver')

const payerFilter = /\s+\w+\s+\w+$/i
const columns = ['date', 'description', 'amount']

const parseAmount = amount => parseFloat(amount.replace('.', '').replace(',', '.'))

const parsePayer = payer => (payer && payer.replace(payerFilter, '').replace(',', ''))

const getExpanseManagerRecord = record => {
	const payer = parsePayer(record[columns[1]]);
	const { category, subCategory } = categoryResolver.resolveCategory(payer);
	return moment(record[columns[0]], 'DD/MM/YYYY').format('DD.MM.YYYY') + ','
		+ parseAmount(record[columns[2]]) + ',' + category + ',' + subCategory
		+ ',Credit Card,,,' + payer
		+ ',,,CitiBank\n'
}

exports.convertCvsFile = (input, onError = console.error) =>
	fs.createReadStream(input)
		.on('error', onError)
		.pipe(csv.parse({ delimiter: ',', columns, relax_column_count: true }))
		.on('error', onError)
		.pipe(csv.transform((record, callback) => {
			const description = record[columns[1]]
			if (!(description && description.startsWith('SPŁATA-'))) {
				setTimeout(() => callback(null, getExpanseManagerRecord(record)))
			}
		}))
