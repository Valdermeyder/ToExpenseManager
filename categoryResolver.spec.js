const categoryResolver = require('./categoryResolver')

const groceries = {
    category: "Food",
    subCategory: "Groceries"
}
const income = {
    category: 'Income',
    subCategory: ''

}
const incomeDeposit = {
    category: 'Income',
    subCategory: 'Deposit'
}
const categoriesMapping = {
    CARREFOUR: groceries,
    deposit: incomeDeposit
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

test('should be case insensetive when parse name of payer and configuration entity', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('carrefour')).toEqual(groceries)
})


test('should be able to use part of word when parse name of payer and configuration entity', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('carrefour.pl')).toEqual(groceries)
})

test('should parse name of payer part of each is present in configuration entity', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('CARREFOUR EXPRESS 3561')).toEqual(groceries)
})

test('should return Income category when amount is bigger than 0', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('any', 0.01)).toEqual(income)
})

test('should return Income category when amount is bigger than 0 even when other was set before', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('carrefour.pl', 0.01)).toEqual(income)
})

test('should not change Income category when amount is bigger than 0 even when other was set before', () => {
    expect(categoryResolver.resolveCategory(categoriesMapping)('Deposit', 0.01)).toEqual(incomeDeposit)
})