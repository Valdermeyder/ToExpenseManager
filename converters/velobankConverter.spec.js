const citiConverter = require('./velobankConverter')

const categoriesMapping = {
    'Play': { category: 'Utilities', subCategory: 'Telephone' },
    'Employer': { category: 'Income', subCategory: 'Salary' },
    'Deposit': { category: 'Income', subCategory: 'Deposit' },
    'FHU GREGOR': { category: 'Groceries', subCategory: 'Supermarket' }
};

test('should be able to convert Velobank manually created CSV files format', (done) => {
    const input = `30.10.2019,24.11.2023,Employer,"9 839,29 PLN","1 574,59 PLN"
28.10.2019,24.11.2023,"Operacja kartą na kwotę 17,99 PLN w Play, GDANSK, PL","-10,00 PLN","2 374,59 PLN"
22.12.2025,29.12.2025,"Operacja kart? 1111 **** **** 1111 na kwot? 9,00 PLN w Operacja kart? 1111 xxxx xxxx
1111 na kwot? 9,00 PLN w FHU GREGOR, GDANSK, POL","-9,00 PLN",""
20.12.2025,20.12.2025,"Przelew z rachunku: 12 1560 0013 2015 4742 6000 0001,
Nadawca: HUZAR VOLODYMYR,
Tytu?: BLIK: P?atno?? BLIK w sklepie","-27,83 PLN",""`
    const expected = `30.10.2019,9839.29,Income,Salary,Credit Card,,,Employer,,,GetIn
28.10.2019,-10,Utilities,Telephone,Credit Card,,,Play,,,GetIn
22.12.2025,-9,Groceries,Supermarket,Credit Card,,,FHU GREGOR,,,GetIn
20.12.2025,-27.83,,,Credit Card,,,BLIK: P?atno?? BLIK w sklepie,,,GetIn
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
