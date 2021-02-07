const { sanitize } = require('./utils')

describe('sanitize', () => {
    test('should remove all csv separator "," characters', () => {
        expect(sanitize('Some, strange, value')).toBe('Some strange value');
    })    
    test('should return undefined when no value', () => {
        expect(sanitize()).toBeUndefined();
    })
})