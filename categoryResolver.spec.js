const categoryResolver = require('./categoryResolver')

test('should return object with empty values if payer is not found in found in configuration', () => {
    expect(categoryResolver.resolveCategory('Not existed')).toEqual({
        category: "",
        subCategory: ""
    })
})

test('should parse exact name of payer and configuration entity', () => {
    expect(categoryResolver.resolveCategory('CARREFOUR')).toEqual({
        category: "Food",
        subCategory: "Groceries"
    })
})

test('should parse name of payer part of each is present in configuration entity', () => {
    expect(categoryResolver.resolveCategory('CARREFOUR EXPRESS 3561')).toEqual({
        category: "Food",
        subCategory: "Groceries"
    })
})