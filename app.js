console.log('City to Expense Manager converter')
const fs = require('fs')
const cityConverter = require('./cityConverter')

const inputFileName = '../ACCT_03_09_2017.csv';
const outputFileName = inputFileName.substring(0, inputFileName.lastIndexOf('.')) + '_converted.csv';

cityConverter.convertCvsFile(inputFileName).pipe(fs.createWriteStream(outputFileName))
