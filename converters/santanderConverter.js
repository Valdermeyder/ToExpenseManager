const { parse } = require("csv-parse/sync");
const { transform } = require("stream-transform");
const moment = require("moment");
const categoryResolver = require("../categoryResolver");
const { sanitize } = require("../utils");

const columns = [
  "operationDate",
  "payDate",
  "description",
  "payer",
  "payerAccount",
  "amount",
  "empty",
  "index",
];

const parseAmount = (amount) => parseFloat(amount.replace(",", "."));
function extractCurrency(description) {
  const currencyMatch = description.match(/\b(\d+\.\d+)\s+([A-Z]{3})\b/);
  return currencyMatch ? currencyMatch[2] : 'PLN';
}

function normalisePayer(description) {
  const currency = extractCurrency(description);
  if (currency === 'PLN') {
    return description.replace(/^.*PLN /, '');
  }
  // For non-PLN currencies, extract merchant name after amount and currency
  const match = description.match(/\d+\.\d+\s+[A-Z]{3}\s+(.+)$/);
  if (match) {
    let merchantName = match[1];
    // Remove any remaining currency codes from the merchant name
    merchantName = merchantName.replace(/\s+[A-Z]{3}\s+.*$/, '');
    return merchantName.trim();
  }
  return description;
}

const BANK_NAME = "Santander";

function descriptionToPayer(description) {
  if (description.startsWith("Suma nagród za płatności")) {
    return BANK_NAME;
  }
  if (description.includes("Opłata za prowadzenie rachunku")) {
    return BANK_NAME;
  }
  return normalisePayer(description);
}

function parsePayer(payer, description) {
  return payer || descriptionToPayer(description);
}

const getExpenseManagerRecord = (recordCategoryResolver) => (record) => {
  const amount = parseAmount(record[columns[5]]);
  const payer = parsePayer(record[columns[3]], record[columns[2]]);
  const currency = extractCurrency(record[columns[2]]);
  const currencySuffix = currency !== 'PLN' ? (" " + currency) : "";
  const originalDescription = sanitize(record[columns[2]]);
  const { category, subCategory } = recordCategoryResolver(payer, amount);
  return (
    moment(record[columns[1]], "DD-MM-YYYY").format("DD.MM.YYYY") +
    "," +
    amount +
    "," +
    category +
    "," +
    subCategory +
    ",Credit Card," +
    originalDescription +
    ",," +
    sanitize(payer) +
    ",,," +
    BANK_NAME +
    currencySuffix +
    "\n"
  );
};

exports.convertCvsFileData = (input, categoriesMapping) => {
  const getExpenseManagerWithMapping = getExpenseManagerRecord(
    categoryResolver.resolveCategory(categoriesMapping)
  );
  return transform(
    parse(input, {
      delimiter: ",",
      columns,
      relax_column_count: true,
      relax: true,
      relax_quotes: true
    })
      .slice(1)
      .filter((record) => record),
    (record) => getExpenseManagerWithMapping(record)
  );
};
