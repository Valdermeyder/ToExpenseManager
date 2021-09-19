const nestConverter = require('./nestConverter')
const { sanitize } = require('../utils')

test('should be able to convert Nest CSV files format', (done) => {
    const categoriesMapping = {
        'H AND M': { category: 'Personal', subCategory: 'Clothing' },
        'Kasownik': { category: 'Transport', subCategory: 'Public transport' }
    };
    const firstTransactionDescription = 'Opis transakcji, detale'
    const secondTransactionDescription = 'H AND M GAL. BALTYCKA|Provider and adres|Operation details|Numer transakcji BLIK: 0000000000'
    const input = `Numer rachunku: 1234567890,
Właściciel: Test user,
Historia operacji za okres od 01.05.2020 do 14.10.2020,
Liczba operacji: 2,
Suma uznań: 0 PLN,
Suma obciążeń: -479.41 PLN,
Data księgowania,Data operacji,Rodzaj operacji,Kwota,Waluta,Dane kontrahenta,Numer rachunku kontrahenta,Tytuł operacji,Saldo po operacji,
13-10-2020,08-10-2020,Płatności kartą,-19.17,PLN,"KASOWNIK 12|ul. Kasownika|00-000 Miasto",,"${firstTransactionDescription}",6336.4,
23-09-2020,19-09-2020,Płatności kartą,-16,PLN,,,"${secondTransactionDescription}",3964.82,`
    const expected = `08.10.2020,-19.17,Transport,Public transport,Credit Card,${sanitize(firstTransactionDescription)},,KASOWNIK 12,,,Nest
19.09.2020,-16,Personal,Clothing,Credit Card,${secondTransactionDescription},,H AND M GAL. BALTYCKA,,,Nest
`
    let transformedData = '';

    const converter = nestConverter.convertCvsFileData(input, categoriesMapping)
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
