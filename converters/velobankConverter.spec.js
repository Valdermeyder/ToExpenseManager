const citiConverter = require('./velobankConverter')

const categoriesMapping = {
    'Play': { category: 'Utilities', subCategory: 'Telephone' },
    'Employer': { category: 'Income', subCategory: 'Salary' },
    'Deposit': { category: 'Income', subCategory: 'Deposit' }
};

test('should be able to convert Velobank manually created CSV files format', (done) => {
    const input = `30.10.2019,24.11.2023,Employer,"9 839,29 PLN","1 574,59 PLN"
28.10.2019,24.11.2023,"Operacja kartą na kwotę 17,99 PLN w Play, GDANSK, PL","-10,00 PLN","2 374,59 PLN"`
    const expected = `30.10.2019,9839.29,Income,Salary,Credit Card,,,Employer,,,GetIn
28.10.2019,-10,Utilities,Telephone,Credit Card,,,Play,,,GetIn
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
