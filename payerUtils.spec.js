const { sanitizePayer } = require('./payerUtils')

describe('sanitizePayer', () => {
    test('should remove all csv separator "," characters', () => {
        expect(sanitizePayer('Some, strange, payer')).toBe('Some strange payer');
    })
})