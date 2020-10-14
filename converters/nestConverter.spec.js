const nestConverter = require('./nestConverter')

test('should be able to convert PKO CSV files format', (done) => {
    const categoriesMapping = {
        'H AND M': { category: 'Personal', subCategory: 'Clothing' },
        'Kasownik': { category: 'Transport', subCategory: 'Public transport' }
    };
    const input = `Numer rachunku: 1234567890,
Właściciel: Test user,
Historia operacji za okres od 01.05.2020 do 14.10.2020,
Liczba operacji: 2,
Suma uznań: 0 PLN,
Suma obciążeń: -479.41 PLN,
Data księgowania,Data operacji,Rodzaj operacji,Kwota,Waluta,Dane kontrahenta,Numer rachunku kontrahenta,Tytuł operacji,Saldo po operacji,
13-10-2020,08-10-2020,Płatności kartą,-19.17,PLN,,,"Transakcja bezgotówkowa |Nr karty ...7149 Gdansk KASOWNIK 12 19,17PLN",6336.4,
23-09-2020,19-09-2020,Płatności kartą,-16,PLN,,,"Transakcja bezgotówkowa |Nr karty ...7149 Gdansk H AND M GAL. BALTYCKA 16,00PLN",3964.82,`
    const expected = `08.10.2020,-19.17,Transport,Public transport,Credit Card,,,KASOWNIK 12,,,Nest
19.09.2020,-16,Personal,Clothing,Credit Card,,,H AND M GAL. BALTYCKA,,,Nest
`
    let transformedData = '';

    const converter = nestConverter.convertCvsFileData(input, categoriesMapping)
        .on('readable', function () {
            while (row = converter.read()) {
                transformedData += row
            }
        })
        .on('finish', () => {
            expect(transformedData).toEqual(expected)
            done()
        })
})
