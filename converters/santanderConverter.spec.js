const santanderConverter = require('./santanderConverter')

test('should be able to convert Santander CSV files format', (done) => {
    const categoriesMapping = {
        'H AND M': { category: 'Personal', subCategory: 'Clothing' },
        'Kasownik': { category: 'Transport', subCategory: 'Public transport' }
    };
    const input = `operationDate,payDate,description,payer,payerAccount,amount,empty,index
21-10-2022,19-04-2019,Description 1,KASOWNIK 12,11 2222 3333,"-3,20",,1,
20-10-2022,19-04-2019,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 48.78 PLN H AND M GAL. BALTYCKA,,22 3333 44444,"-48,78",,2,`
    const expected = `19.04.2019,-3.2,Transport,Public transport,Credit Card,Description 1,,KASOWNIK 12,,,Santander
19.04.2019,-48.78,Personal,Clothing,Credit Card,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 48.78 PLN H AND M GAL. BALTYCKA,,H AND M GAL. BALTYCKA,,,Santander
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

test('should extract and append currency from description', (done) => {
    const categoriesMapping = {
        'Gate Retail Wizz': { category: 'Food', subCategory: 'Outside' }
    };
    const input = `operationDate,payDate,description,payer,payerAccount,amount,empty,index
09-01-2026,07-01-2026,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 5.00 EUR Gate Retail Wizz EUR Luton,,,"-5,00","36,47",1,`
    const expected = `07.01.2026,-5,Food,Outside,Credit Card,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 5.00 EUR Gate Retail Wizz EUR Luton,,Gate Retail Wizz,,,Santander EUR
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
            setTimeout(() => {
                expect(transformedData).toEqual(expected)
                done()
            })
        })
})

test('should handle multiple currencies in same file', (done) => {
    const categoriesMapping = {
        'Gate Retail Wizz': { category: 'Food', subCategory: 'Outside' },
        'H AND M GAL. BALTYCKA': { category: 'Personal', subCategory: 'Clothing' }
    };
    const input = `operationDate,payDate,description,payer,payerAccount,amount,empty,index
09-01-2026,07-01-2026,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 5.00 EUR Gate Retail Wizz EUR Luton,,,"-5,00","36,47",1,
20-10-2022,19-04-2019,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 48.78 PLN H AND M GAL. BALTYCKA,,22 3333 44444,"-48,78",,2,`
    const expected = `07.01.2026,-5,Food,Outside,Credit Card,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 5.00 EUR Gate Retail Wizz EUR Luton,,Gate Retail Wizz,,,Santander EUR
19.04.2019,-48.78,Personal,Clothing,Credit Card,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 48.78 PLN H AND M GAL. BALTYCKA,,H AND M GAL. BALTYCKA,,,Santander
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
            setTimeout(() => {
                expect(transformedData).toEqual(expected)
                done()
            })
        })
})

test('should handle account fee descriptions', (done) => {
    const categoriesMapping = {
        'Santander': { category: 'Banking', subCategory: 'Fees' }
    };
    const input = `operationDate,payDate,description,payer,payerAccount,amount,empty,index
30-09-2023,30-09-2023,Opłata za prowadzenie rachunku od 01.09.2023 do 30.09.2023,,,"-2,16","-1,18",1,`
    const expected = `30.09.2023,-2.16,Banking,Fees,Credit Card,Opłata za prowadzenie rachunku od 01.09.2023 do 30.09.2023,,Santander,,,Santander
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
            setTimeout(() => {
                expect(transformedData).toEqual(expected)
                done()
            })
        })
})
