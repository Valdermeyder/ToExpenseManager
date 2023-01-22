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
function descriptionToPayer(description) {
  if (description.startsWith("Suma nagród za płatności")) {
    return "Santander returns";
  }
  return description;
}
function parsePayer(payer, description) {
  return payer || descriptionToPayer(description);
}

const getExpenseManagerRecord = (recordCategoryResolver) => (record) => {
  const amount = parseAmount(record[columns[5]]);
  const payer = parsePayer(record[columns[3]], record[columns[2]]);
  const { category, subCategory } = recordCategoryResolver(payer, amount);
  return (
    moment(record[columns[1]], "DD-MM-YYYY").format("DD.MM.YYYY") +
    "," +
    amount +
    "," +
    category +
    "," +
    subCategory +
    ",Credit Card,,," +
    sanitize(payer) +
    ",,,Santander\n"
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
    })
      .slice(1)
      .filter((record) => record),
    (record) => getExpenseManagerWithMapping(record)
  );
};
