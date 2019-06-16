const pkoConverter = require('./pkoConverter')

test('should be able to convert PKO CSV files format', (done) => {
    const categoriesMapping = { 'H AND M': { category: 'Personal', subCategory: 'Clothing' }, 'Kasownik': { category: 'Transport', subCategory: 'Public transport' } };
    const input = `"Data operacji","Data waluty","Typ transakcji","Kwota","Waluta","Saldo po transakcji","Opis transakcji","","","",""
"2019-04-21","2019-04-19","P�atno�� kart�","-3.20","PLN","+5628.08","Tytu�: 010061097 74169509109951095304354","Lokalizacja: Kraj: POLSKA Miasto: GDANSK Adres: KASOWNIK 12","Data i czas operacji: 2019-04-19","Oryginalna kwota operacji: 3,20 PLN","Numer karty: 425125******3586"
"2019-04-21","2019-04-19","P�atno�� kart�","-48.78","PLN","+5631.28","Tytu�: 000498849 74230789109067613321359","Lokalizacja: Kraj: POLSKA Miasto: GDANSK Adres: H AND M GAL. BALTYCKA","Data i czas operacji: 2019-04-19","Oryginalna kwota operacji: 48,78 PLN","Numer karty: 425125******3586"`
    const exptected = `19.04.2019,-3.2,Transport,Public transport,Credit Card,,,KASOWNIK 12,,,PKO
19.04.2019,-48.78,Personal,Clothing,Credit Card,,,H AND M GAL. BALTYCKA,,,PKO
`
    let transformedData = '';

    pkoConverter.convertCvsFileData(input, categoriesMapping)
        .on('readable', function () {
            // eslint-disable-next-line no-invalid-this
            let row = this.read()
            while (row) {
                transformedData += row
                // eslint-disable-next-line no-invalid-this
                row = this.read()
            }
        })
        .on('finish', () => {
            expect(transformedData).toEqual(exptected)
            done()
        })
})