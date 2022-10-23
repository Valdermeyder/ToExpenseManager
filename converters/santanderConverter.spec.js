const santanderConverter = require('./santanderConverter')

test('should be able to convert PKO CSV files format', (done) => {
    const categoriesMapping = {
        'H AND M': { category: 'Personal', subCategory: 'Clothing' },
        'Kasownik': { category: 'Transport', subCategory: 'Public transport' }
    };
    const input = `2022-10-23,25-09-2022,'11 2222 3333 4444,Owner address,PLN,,,17,
21-10-2022,19-04-2019,Description 1,KASOWNIK 12,11 2222 3333,"-3,20",,1,
20-10-2022,19-04-2019,Description 2,H AND M GAL. BALTYCKA,22 3333 44444,"-48,78",,2,`
    const expected = `19.04.2019,-3.2,Transport,Public transport,Credit Card,,,KASOWNIK 12,,,Santander
19.04.2019,-48.78,Personal,Clothing,Credit Card,,,H AND M GAL. BALTYCKA,,,Santander
`
    let transformedData = '';

    const converter = santanderConverter.convertCvsFileData(input, categoriesMapping)
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

test.skip('should add synthetic payer from description', (done) => {
    const categoriesMapping = {
        'Bank': { category: 'Bank', subCategory: 'Commission' },
        'Santander returns': { category: 'Income', subCategory: 'Deposit' }
    };
    const input = `2022-10-23,25-09-2022,'11 2222 3333 4444,Owner address,PLN,,,17,
21-10-2022,19-04-2019,Bank,,,"-3,20",,1,
20-10-2022,19-04-2019,Suma nagród za płatności Description 2,,,"48,78",,2,`
    const expected = `19.04.2019,-3.2,Bank,Commission,Credit Card,,,Bank,,,Santander
19.04.2019,48.78,Income,Deposit,Credit Card,,,Santander returns,,,Santander
`
    let transformedData = '';

    const converter = santanderConverter.convertCvsFileData(input, categoriesMapping)
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