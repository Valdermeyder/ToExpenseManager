const pkoConverter = require('./pkoConverter')

test('should be able to convert PKO CSV files format', (done) => {
    const categoriesMapping = {
        'H AND M': { category: 'Personal', subCategory: 'Clothing' },
        'Kasownik': { category: 'Transport', subCategory: 'Public transport' }
    };
    const input = `"Data operacji","Data waluty","Typ transakcji","Kwota","Waluta","Saldo po transakcji","Opis transakcji","","","",""
"2019-04-21","2019-04-19","P�atno�� kart�","-3.20","PLN","+5628.08","Tytu�: 010061097 74169509109951095304354","Lokalizacja: Kraj: POLSKA Miasto: GDANSK Adres: KASOWNIK 12","Data i czas operacji: 2019-04-19","Oryginalna kwota operacji: 3,20 PLN","Numer karty: 425125******3586"
"2019-04-21","2019-04-19","P�atno�� kart�","-48.78","PLN","+5631.28","Tytu�: 000498849 74230789109067613321359","Lokalizacja: Kraj: POLSKA Miasto: GDANSK Adres: H AND M GAL. BALTYCKA","Data i czas operacji: 2019-04-19","Oryginalna kwota operacji: 48,78 PLN","Numer karty: 425125******3586"`
    const expected = `19.04.2019,-3.2,Transport,Public transport,Credit Card,,,KASOWNIK 12,,,PKO
19.04.2019,-48.78,Personal,Clothing,Credit Card,,,H AND M GAL. BALTYCKA,,,PKO
`
    let transformedData = '';

    const converter = pkoConverter.convertCvsFileData(input, categoriesMapping)
        .on('readable', () => {
            let row = converter.read()
            while (row) {
                transformedData += row
                row = converter.read()
            }
        })
        .on('finish', () => {
            expect(transformedData).toEqual(expected)
            done()
        })
})

test('should recognize payer by transaction type', (done) => {
    const categoriesMapping = {
        'Bank': { category: 'Bank', subCategory: 'Commission' },
        'Deposit': { category: 'Income', subCategory: 'Deposit' }
    };
    const input = `"Data operacji","Data waluty","Typ transakcji","Kwota","Waluta","Saldo po transakcji","Opis transakcji","","","",""
"2019-10-12","2019-10-13","Naliczenie odsetek","+3.99","PLN","+12.91","Tytu³: ODSETKI NALE¯NE LOKATY NR00004","","","","",""
"2019-05-15","2019-05-13","Prowizja","-6.00","PLN","+45.85","Tytu³: 74146649133000134676505","","","","",""
"2019-05-15","2019-05-13","Op�ata za u�ytkowanie karty","-6.00","PLN","+45.85","Tytu³: 74146649133000134676505","","","","",""`
    const expected = `13.10.2019,3.99,Income,Deposit,Credit Card,,,Deposit,,,PKO
13.05.2019,-6,Bank,Commission,Credit Card,,,Bank,,,PKO
13.05.2019,-6,Bank,Commission,Credit Card,,,Bank,,,PKO
`
    let transformedData = '';

    const converter = pkoConverter.convertCvsFileData(input, categoriesMapping)
        .on('readable', () => {
            let row = converter.read()
            while (row) {
                transformedData += row
                row = converter.read()
            }
        })
        .on('finish', () => {
            expect(transformedData).toEqual(expected)
            done()
        })
})

test('should extract payer from "Nazwa nadawcy"', (done) => {
    const categoriesMapping = {
        'testowy nadawca': { category: 'Income', subCategory: 'Deposit' }
    };
    const input = `"Data operacji","Data waluty","Typ transakcji","Kwota","Waluta","Saldo po transakcji","Opis transakcji","","","",""
"2019-10-12","2019-10-13","Przelew na rachunek","+3.99","PLN","+12.91","Rachunek nadawcy: 11 1111 1111 1111 1111 1111 1111","Nazwa nadawcy: testowy nadawca","","","",""`
    const expected = `13.10.2019,3.99,Income,Deposit,Credit Card,,,testowy nadawca,,,PKO
`
    let transformedData = '';

    const converter = pkoConverter.convertCvsFileData(input, categoriesMapping)
        .on('readable', () => {
            let row = converter.read()
            while (row) {
                transformedData += row
                row = converter.read()
            }
        })
        .on('finish', () => {
            expect(transformedData).toEqual(expected)
            done()
        })
})