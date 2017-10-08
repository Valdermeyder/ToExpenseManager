console.log('City to Expense Manager converter')
const fs = require('fs')
const cityConverter = require('./cityConverter')

const inputFileName = '../citibank_original_june_september.csv';
const outputFileName = inputFileName.substring(0, inputFileName.lastIndexOf('.')) + '_converted.csv';

cityConverter.convertCvsFile(inputFileName).pipe(fs.createWriteStream(outputFileName))
