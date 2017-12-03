const payerIncludesCategory = payer => payerFromCfg => payer.includes(payerFromCfg)

const getCategoryConf = (payer, categoriesMapping = {}) => categoriesMapping[payer]
	|| categoriesMapping[Object.keys(categoriesMapping)
		.filter(payerIncludesCategory(payer))[0]]

exports.resolveCategory = categoriesMapping => payer => getCategoryConf(payer, categoriesMapping) || { category: '', subCategory: '' }
