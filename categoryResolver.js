const payerIncludesCategory = payer => payerFromCfg => new RegExp(payerFromCfg, 'i').test(payer)

const getCategoryConf = (payer, categoriesMapping = {}) => categoriesMapping[payer]
	|| categoriesMapping[
	Object.keys(categoriesMapping).find(payerIncludesCategory(payer))
	]

exports.resolveCategory = categoriesMapping => (payer, amount) => {
	const fullCategory = getCategoryConf(payer, categoriesMapping) || { category: '', subCategory: '' }
	if (amount && amount > 0 && fullCategory.category !== 'Income') {
		return { category: 'Income', subCategory: ''}
	}
	return fullCategory;
}

