const fs = require('fs')
const csv = require('csv')
const moment = require('moment')

const payerFilter = /\s+\w+\s+\w+$/i
const columns = ['date', 'description', 'amount']

const parseAmount = amount => parseFloat(amount.replace('.', '').replace(',', '.'))

const parsePayer = payer => (payer && payer.replace(payerFilter, ''))

const getExpanseManagerRecord = record =>
	moment(record[columns[0]], 'DD/MM/YYYY').format('DD.MM.YYYY') + ','
	+ parseAmount(record[columns[2]]) + ',,,Credit Card,,,\"' + parsePayer(record[columns[1]])
	+ '\",,,CitiBank' + '\n'

exports.convertCvsFile = input => {
	const readStream = fs.createReadStream(input);

	readStream.on('error', console.error)

	return readStream
		.pipe(csv.parse({delimiter: ',', columns, relax_column_count: true}))
		.pipe(csv.transform((record, callback) => {
			const description = record[columns[1]]
			if (!(description && description.startsWith('SPŁATA-'))) {
				setTimeout(() => callback(null, getExpanseManagerRecord(record)))
			}
		}))
}