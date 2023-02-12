const { parse } = require("csv-parse/sync");
const { transform } = require("stream-transform");
const categoryResolver = require("../categoryResolver");
const { sanitize } = require("../utils");

const columns = [
  "Date and time",
  "Description",
  "MCC",
  "Card currency amount, (UAH)",
  "Operation amount",
  "Operation currency",
  "Exchange rate",
  "Commission, (UAH)",
  "Cashback amount, (UAH)",
  "Balance",
];

const parseAmount = (amount) => parseFloat(amount);

const getExpenseManagerRecord = (recordCategoryResolver) => (record) => {
  const amount = parseAmount(record[columns[3]]);
  const payer = record[columns[1]];
  const { category, subCategory } = recordCategoryResolver(payer, amount);
  return (
    record[columns[0]].split(" ")[0] +
    "," +
    amount +
    "," +
    category +
    "," +
    subCategory +
    ",Credit Card,,," +
    sanitize(payer) +
    ",,,Monobank\n"
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
