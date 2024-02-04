exports.normalizeCategories = (categories) => categories && Object.keys(categories).reduce((payerByCategory, categoryKey) => {
    const category = categories[categoryKey];
    return Object.keys(category).reduce((subCategoriesWithPayers, subCategoryKey) => {
        const payers = category[subCategoryKey] || []
        if (!Array.isArray(payers)) {
            throw new Error(`Payers for "${subCategoryKey}" is not an array`)
        }
        return payers.reduce((payersWithSubCategory, payer) =>
            ({ ...payersWithSubCategory, [payer]: { category: categoryKey, subCategory: subCategoryKey } }), subCategoriesWithPayers)
    }, payerByCategory)
}, {});
