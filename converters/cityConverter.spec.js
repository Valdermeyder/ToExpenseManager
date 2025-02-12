const citiConverter = require('./cityConverter')

const categoriesMapping = {
    'Play': { category: 'Utilities', subCategory: 'Telephone' },
    'Employer': { category: 'Income', subCategory: 'Salary' },
    'Deposit': { category: 'Income', subCategory: 'Deposit' }
};

test('should be able to convert Citi CSV files format for PLN', (done) => {
    const currency = 'PLN'
    const input = `"30/10/2019","Employer","9.839,29","9.997,16","'1234567890'","PRZELEW ZEWNETRZNY WPLATA"
"28/10/2019","Play SA         76920   Gdansk       PL 5575054750123136        10.00 ${currency} 08:52 210414","-10,00","123,45","'1234567890'","PRZELEW DOŁADOWANIE KOMÓRKI"`
    const expected = `30.10.2019,9839.29,Income,Salary,Credit Card,,,Employer,,,Citi ${currency}
28.10.2019,-10,Utilities,Telephone,Credit Card,,,Play SA,,,Citi ${currency}
`
    let transformedData = '';

    const converter = citiConverter.convertCvsFileData(input, categoriesMapping)
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

test('should be able to convert Citi CSV files format for EUR', (done) => {
    const currency = 'EUR'
    const input = `"30/10/2019","Employer ${currency}","9.839,29","9.997,16","'1234567890'","PRZELEW ZEWNETRZNY WPLATA"
"28/10/2019","Play SA         76920   Gdansk       PL 5575054750123136        10.00 ${currency} 08:52 210414","-10,00","123,45","'1234567890'","PRZELEW DOŁADOWANIE KOMÓRKI"`
    const expected = `30.10.2019,9839.29,Income,Salary,Credit Card,,,Employer ${currency},,,Citi ${currency}
28.10.2019,-10,Utilities,Telephone,Credit Card,,,Play SA,,,Citi ${currency}
`
    let transformedData = '';

    const converter = citiConverter.convertCvsFileData(input, categoriesMapping)
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

test('should ignore paying credit type transactions', (done) => {
    const input = `"31/10/2019","1234567890","-4.592,54","5.404,62","'1234567890'","SPŁATA KARTY KREDYTOWEJ"
"31/10/2019","1234567890","-4.592,54","5.404,62","'1234567890'","CREDIT CARD REPAYMENT"
"31/10/2019","1234567890","-4.592,54","5.404,62","'1234567890'","CITIBANK MASTERCARD PAYMENT"
"28/10/2019","Play","-10,00","123,45","'1234567890'","PRZELEW DOŁADOWANIE KOMÓRKI"`
    const expected = `28.10.2019,-10,Utilities,Telephone,Credit Card,,,Play,,,Citi PLN
`
    let transformedData = '';

    const converter = citiConverter.convertCvsFileData(input, categoriesMapping)
        .on('readable', () => {
            let row = converter.read()
            while (row) {
                transformedData += row
                row = converter.read()
            }
        })
        .on('error', (err) => console.log(err.message))
        .on('finish', () => {
            setTimeout(() => {
                expect(transformedData).toEqual(expected)
                done()
            })
        })
})

test('should ignore records payer of which starts with "SPŁATA"', (done) => {
    const input = `"31/10/2019","SPŁATA-1234567890","4.592,54","''","SPŁATA-1234567890"
"28/10/2019","Play","-10,00","123,45","'1234567890'","PRZELEW DOŁADOWANIE KOMÓRKI"`
    const expected = `28.10.2019,-10,Utilities,Telephone,Credit Card,,,Play,,,Citi PLN
`
    let transformedData = '';

    const converter = citiConverter.convertCvsFileData(input, categoriesMapping)
        .on('readable', () => {
            let row = converter.read()
            while (row) {
                transformedData += row
                row = converter.read()
            }
        })
        .on('error', (err) => console.log(err.message))
        .on('finish', () => {
            setTimeout(() => {
                expect(transformedData).toEqual(expected)
                done()
            })
        })
})

test('should set payer as Deposit for transaction type "ODSETKI - LOKATA TERMINOWA"', (done) => {
    const input = `"12/09/2019","12345678901234567890","0,68","","'1234567890'","ODSETKI - LOKATA TERMINOWA"
"28/10/2019","Play","-10,00","123,45","'1234567890'","PRZELEW DOŁADOWANIE KOMÓRKI"`
    const expected = `12.09.2019,0.68,Income,Deposit,Credit Card,,,Deposit,,,Citi PLN
28.10.2019,-10,Utilities,Telephone,Credit Card,,,Play,,,Citi PLN
`
    let transformedData = '';

    const converter = citiConverter.convertCvsFileData(input, categoriesMapping)
        .on('readable', () => {
            let row = converter.read()
            while (row) {
                transformedData += row
                row = converter.read()
            }
        })
        .on('error', (err) => console.log(err.message))
        .on('finish', () => {
            setTimeout(() => {
                expect(transformedData).toEqual(expected)
                done()
            })
        })
})