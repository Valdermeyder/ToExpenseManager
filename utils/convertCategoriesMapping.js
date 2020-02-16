const payers = require('path/to/old/mapping/payerByCategories.json');
const fs = require('fs');
const mergeWith = require('lodash/mergeWith')
const isArray = require('lodash/isArray')

function customizer(objValue, srcValue) {
    if (isArray(objValue) && srcValue) {
        return objValue.concat(srcValue);
    }
}

fs.writeFile('path/to/new/mapping/categoriesWithPayers.json', JSON.stringify(Object.keys(payers).reduce((categoriesWithPayers, payerKey) => {
    const payer = payers[payerKey];
    const { category, subCategory } = payer
    return mergeWith({ [category]: { [subCategory]: [payerKey] } }, categoriesWithPayers, customizer)
}, {})), console.log);