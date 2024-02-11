const revolutConverter = require('./revolutConverter')

const categoriesMapping = {
    'Play': { category: 'Utilities', subCategory: 'Telephone' },
    'Employer': { category: 'Income', subCategory: 'Salary' },
    'Deposit': { category: 'Income', subCategory: 'Deposit' }
};

test('should be able to convert Revolut manually created CSV files format', (done) => {
    const input = `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
EXCHANGE,Current,2024-01-12 20:43:05,2024-01-12 20:43:05,Exchanged to SEK,643.88,0.00,SEK,COMPLETED,1.77
CARD_PAYMENT,Current,2019-10-30 09:19:33,2024-01-15 21:52:33,Employer,9839.29,0.00,SEK,COMPLETED,7.77
CARD_PAYMENT,Current,2019-10-28 19:37:14,2024-01-15 21:56:09,Play,-10.00,0.00,SEK,COMPLETED,2.77`
    const expected = `30.10.2019,9839.29,Income,Salary,Credit Card,,,Employer,,,Revolut SEK
28.10.2019,-10,Utilities,Telephone,Credit Card,,,Play,,,Revolut SEK
`
    let transformedData = '';

    const converter = revolutConverter.convertCvsFileData(input, categoriesMapping)
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
