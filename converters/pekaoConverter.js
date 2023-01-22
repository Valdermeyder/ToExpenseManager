const parseSync = require("csv-parse/lib/sync");
const transform = require("stream-transform");
const categoryResolver = require("../categoryResolver");
const { sanitize } = require("../utils");

const columns = [
  "operationDate",
  "payDate",
  "payer",
  "payerAddress",
  "accountSrc",
  "accountDst",
  "description",
  "amount",
];

const parseAmount = (amount) => parseFloat(amount.replace(",", ".").replace(" ", ""));
function descriptionToPayer(description) {
  if (description.startsWith("POBRANIE ZALEGŁEJ OPŁATY")) {
    return "Bank Commission";
  }
  return description;
}
function parsePayer(payer, description) {
  return payer || descriptionToPayer(description);
}

const getExpenseManagerRecord = (recordCategoryResolver) => (record) => {
  const amount = parseAmount(record[columns[7]]);
  const payer = parsePayer(record[columns[2]], record[columns[6]]);
  const { category, subCategory } = recordCategoryResolver(payer, amount);
  return (
    record[columns[1]] +
    "," +
    amount +
    "," +
    category +
    "," +
    subCategory +
    ",Credit Card,,," +
    sanitize(payer) +
    ",,,Pekao\n"
  );
};

exports.convertCvsFileData = (input, categoriesMapping) => {
  const getExpenseManagerWithMapping = getExpenseManagerRecord(
    categoryResolver.resolveCategory(categoriesMapping)
  );
  return transform(
    parseSync(input, {
      delimiter: ";",
      columns,
      relax_column_count: true,
      relax: true,
    })
      .slice(1)
      .filter((record) => record),
    (record) => getExpenseManagerWithMapping(record)
  );
};
