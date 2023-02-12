const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const { normalizeCategories } = require("./mappingNormalizer");
const cityConverter = require("./converters/cityConverter");
const pkoConverter = require("./converters/pkoConverter");
const nestConverter = require("./converters/nestConverter");
const santanderConverter = require("./converters/santanderConverter");
const pekaoConverter = require("./converters/pekaoConverter");
const monobankConverter = require("./converters/monobankConverter");

const app = express();
const port = process.env.PORT || 3000;

const getHttpErrorHandler = (response) => (err) => {
  console.error(err);
  response.status(500).send("Something is broken. Details: " + err);
};
//eslint-disable-next-line no-unused-vars
app.use((err, _, response, _next) => getHttpErrorHandler(response)(err));
app.use(fileUpload());

app.get("/", (_, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

const getCategoriesMapping = (file = {}) =>
  normalizeCategories(file.data && JSON.parse(file.data));

function selectConverter(bank) {
  switch (bank) {
    case "pko":
      return pkoConverter;
    case "nest":
      return nestConverter;
    case "santander":
      return santanderConverter;
    case "pekao":
      return pekaoConverter;
    case "monobank":
      return monobankConverter;
    default:
      return cityConverter;
  }
}

app.post("/", ({ files, body: { bank } }, response) => {
  if (files && files.file) {
    try {
      const converter = selectConverter(bank);
      const csvFile = files.file;
      const originalFileName = csvFile.name.slice(0, -4);
      response.set({
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename=${originalFileName}-converted.csv`,
      });
      converter
        .convertCvsFileData(
          csvFile.data,
          getCategoriesMapping(files.categoriesMapping)
        )
        .on("finish", () => setTimeout(() => response.end()))
        .on("error", getHttpErrorHandler(response))
        .pipe(response);
    } catch (err) {
      response.status(500).send(err);
    }
  } else {
    response.status(400).send("No file was uploaded.");
  }
});

const server = app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  const address = server.address().address;
  console.info(
    `To ExpenseManager converter is running at http://${
      address === "::" ? "localhost" : address
    }:${port}/`
  );
});
