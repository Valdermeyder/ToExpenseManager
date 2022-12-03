const pekaoConverter = require("./pekaoConverter");

test("should be able to convert Pekao CSV files format", (done) => {
  const categoriesMapping = {
    "H AND M": { category: "Personal", subCategory: "Clothing" },
    Kasownik: { category: "Transport", subCategory: "Public transport" },
  };
  const input = `Data księgowania;Data waluty;Nadawca / Odbiorca;Adres nadawcy / odbiorcy;Rachunek źródłowy;Rachunek docelowy;Tytułem;Kwota operacji;Waluta;Numer referencyjny;Typ operacji;Kategoria
19.04.2019;19.04.2019;H AND M GDANSK;;'25124012681111001119078209;;*********0085394;-3,20;PLN;'C992232109692387;TRANSAKCJA KARTĄ PŁATNICZĄ;Artykuły spożywcze
19.04.2019;19.04.2019;Kasownik GDANSK;;'25124012681111001119078209;;*********0085394;-48,78;PLN;'C992231920047319;TRANSAKCJA KARTĄ PŁATNICZĄ;Artykuły spożywcze`;
  const expected = `19.04.2019,-3.2,Personal,Clothing,Credit Card,,,H AND M GDANSK,,,Pekao
19.04.2019,-48.78,Transport,Public transport,Credit Card,,,Kasownik GDANSK,,,Pekao
`;
  let transformedData = "";

  const converter = pekaoConverter
    .convertCvsFileData(input, categoriesMapping)
    .on("readable", () => {
      let row = converter.read();
      while (row) {
        transformedData += row;
        row = converter.read();
      }
    })
    .on("finish", () => {
      expect(transformedData).toEqual(expected);
      done();
    });
});

test("should be able to recognise Pekao specific payments", (done) => {
    const categoriesMapping = {
      "Bank Commission": { category: "Other", subCategory: "Bank Commission" }
    };
    const input = `Data księgowania;Data waluty;Nadawca / Odbiorca;Adres nadawcy / odbiorcy;Rachunek źródłowy;Rachunek docelowy;Tytułem;Kwota operacji;Waluta;Numer referencyjny;Typ operacji;Kategoria
  19.04.2019;19.04.2019;;;'25124012681111001119078209;;POBRANIE ZALEGŁEJ OPŁATY;-0,20;PLN;'03922BF98I000028;POBRANIE ZALEGŁEJ OPŁATY;Opłaty bankowe`;
    const expected = `19.04.2019,-0.2,Other,Bank Commission,Credit Card,,,Bank Commission,,,Pekao
`;
    let transformedData = "";
  
    const converter = pekaoConverter
      .convertCvsFileData(input, categoriesMapping)
      .on("readable", () => {
        let row = converter.read();
        while (row) {
          transformedData += row;
          row = converter.read();
        }
      })
      .on("finish", () => {
        expect(transformedData).toEqual(expected);
        done();
      })
  });
