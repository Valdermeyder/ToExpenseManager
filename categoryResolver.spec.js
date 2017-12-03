const categoryResolver = require('./categoryResolver')

const groceries = {
    category: "Food",
    subCategory: "Groceries"
}
const categoriesMapping = {
    CARREFOUR: groceries
}

test('should return object with empty values if payer is not found in found in configuration', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('Not existed')).toEqual({
        category: "",
        subCategory: ""
    })
})

test('should parse exact name of payer and configuration entity', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('CARREFOUR')).toEqual(groceries)
})

test('should parse name of payer part of each is present in configuration entity', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('CARREFOUR EXPRESS 3561')).toEqual(groceries)
})