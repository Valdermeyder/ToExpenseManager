const { parse } = require("csv-parse/sync");
const { transform } = require("stream-transform");
const moment = require('moment')
const categoryResolver = require("../categoryResolver");
const { sanitize } = require("../utils");

const columns = ["type", "product", "date", "realDate", "description", "amount", "fee", "currency", "balance"];

const parseAmount = (amount) =>
  parseFloat(amount.replace(" ", "").replace(",", "."));

const parseDescription = (description) => {
  const descriptionParts = description.split(",");
  if (descriptionParts.length === 1) {
    return descriptionParts[0];
  }
  const payerPart = descriptionParts[1];
  return payerPart
    .replace("w ", "")
    .replace(/\d+ PLN/, "")
    .trim();
};

const getExpenseManagerRecord = (recordCategoryResolver) => (record) => {
  const payer = parseDescription(record[columns[4]]);
  const currency = record[columns[6]] === "PLN" ? "" : (" " + record[columns[7]]);
  const amount = parseAmount(record[columns[5]]);
  const { category, subCategory } = recordCategoryResolver(payer, amount);
  return (
    moment(record[columns[2]]).format('DD.MM.YYYY') +
    "," +
    amount +
    "," +
    category +
    "," +
    subCategory +
    ",Credit Card,,," +
    sanitize(payer) +
    ",,,Revolut" +
    currency +
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
      relax: true,
      relax_column_count: true,
      bom: true,
    }).slice(1).filter((record) => record[columns[0]] === 'CARD_PAYMENT'),
    (record) => getExpenseManagerWithMapping(record)
  );
};
