const monobankConverter = require('./monobankConverter')

test('should be able to convert Santander CSV files format', (done) => {
    const categoriesMapping = {
        'H AND M': { category: 'Personal', subCategory: 'Clothing' },
        'Kasownik': { category: 'Transport', subCategory: 'Public transport' }
    };
    const input = `"Date and time",Description,MCC,"Card currency amount, (UAH)","Operation amount","Operation currency","Exchange rate","Commission, (UAH)","Cashback amount, (UAH)",Balance,
"19.04.2019 19:45:28","KASOWNIK 12",5262,-3.20,-1.18,PLN,8.4706,—,—,10.21
"19.04.2019 19:45:28","H AND M GAL. BALTYCKA",5262,-48.78,-11.18,PLN,8.4706,—,—,10.21`
    const expected = `19.04.2019,-3.2,Transport,Public transport,Credit Card,,,KASOWNIK 12,,,Monobank
19.04.2019,-48.78,Personal,Clothing,Credit Card,,,H AND M GAL. BALTYCKA,,,Monobank
`
    let transformedData = '';

    const converter = monobankConverter.convertCvsFileData(input, categoriesMapping)
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
