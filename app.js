console.log('City to Expense Manager converter')
const fs = require('fs')
const csv = require('csv')
const moment = require('moment')

const inputFileName = '../ACCT_30_07_2017.csv';
const outputFileName = inputFileName.substring(0, inputFileName.lastIndexOf('.')) + '_converted.csv';

const payerFilter = /\s+\w+\s+\w+$/i

const parseAmount = amount => parseFloat(amount.replace('.', '').replace(',', '.'))

const parsePayer = payer => payer.replace(payerFilter, '')

const getExpanseManagerRecord = record =>
    moment(record['TRANSACTION DATE']).format('DD.MM.YYYY') + ','
    + parseAmount(record.AMOUNT) + ',,,Credit Card,,,\"' + parsePayer(record.DESCRIPTION) + '\",,,CitiBank' + '\n'

fs.createReadStream(inputFileName)
    .pipe(csv.parse({ delimiter: ',', columns: true }))
    .pipe(csv.transform((record, callback) => {
        if (!record.DESCRIPTION.startsWith('SPŁATA-')) { 
            setTimeout(() => callback(null, getExpanseManagerRecord(record)))
        }
    }))
    .pipe(fs.createWriteStream(outputFileName))
