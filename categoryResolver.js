const payerIncludesCategory = payer => payerFromCfg => new RegExp(payerFromCfg, 'i').test(payer)

const getCategoryConf = (payer, categoriesMapping = {}) => categoriesMapping[payer]
	|| categoriesMapping[
		Object.keys(categoriesMapping).find(payerIncludesCategory(payer))
	]

exports.resolveCategory = categoriesMapping => payer => getCategoryConf(payer, categoriesMapping) || { category: '', subCategory: '' }
