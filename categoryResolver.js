const groceries = ['CARREFOUR', 'ZABKA', 'GROSZEK', 'Piotr i Pawel', 'AUCHAN', 'MARKET PUNKT',
	'FRESHMARKET', 'KAUFLAND', 'TESCO', 'LIDL', 'BIEDRONKA', 'SNACK BAR SOUL', 'STARA PETLA']

const desert = ['PAN AND CAKE', 'AWITEKS', 'PIEKARNIA']

const snack = ['McDonalds', 'ChipsyKing', 'SOUL']

const lunch = 'Olimp', food = groceries.concat(desert, lunch, snack)

const payerIncludesCategory = payer => category => payer.includes(category)

const getFoodSubCategory = payer => {
	if (desert.some(payerIncludesCategory(payer))) {
		return 'Desert'
	} else if (payer.includes(lunch)) {
		return 'Lunch'
	} else if (snack.some(payerIncludesCategory(payer))) {
		return 'Snack'
	}
	return 'Groceries'
}

const entertainment = ['TRATTORIA', 'PIZZA', 'Sushi', 'MONIKA SZCZYGIELSKA',
	'Aleksandra Czaplicka', 'PHUONG DONG', 'DONG XUAN', 'DANIELE VANALI']

const furniture = 'IKEA', tools = ['CASTORAMA', 'ALIEXPRESS', 'KREDKA'],
	homeOffice = tools.concat(furniture)

const bank = ['Bank', 'INTEREST'];

const drinks = ['CRAZY BUBBLE'];

const getCategory = (category, subCategory) => ({ category, subCategory })

const matchedBy = payer => categories => categories.some(payerIncludesCategory(payer))

const getHomeOfficeSubCategory = payer => {
	if (payer.includes(furniture)) {
		return 'Furniture'
	}
	return 'Tools'
}

const publicTransport = ['MPAY', 'MPK'], taxi = 'TAXI', transport = publicTransport.concat(taxi)

const getTransportSubCategory = payer => {
	if (payer.includes(taxi)) {
		return 'Taxi'
	}
	return 'Public transport'
}

const medical = ['APTEKA', 'SOFIMED'], cosmetic = 'ROSSMANN', healthCare = medical.concat(cosmetic)

const getHealthCareSubCategory = payer => {
	if (matchedBy(payer)(medical)) {
		return 'Medical'
	}
	return 'Cosmetic'
}

const documents = ['PRYZMAT']

const getFamilySubCategory = () => 'Documents'

exports.resolveCategory = payer => {
	const payerMatchedBy = matchedBy(payer)
	if (payerMatchedBy(food)) {
		return getCategory('Food', getFoodSubCategory(payer))
	} if (payerMatchedBy(transport)) {
		return getCategory('Transport', getTransportSubCategory(payer))
	} if (payerMatchedBy(entertainment)) {
		return getCategory('Entertainment', 'Restaurant')
	} if (payerMatchedBy(healthCare)) {
		return getCategory('Health Care', getHealthCareSubCategory(payer))
	} if (payerMatchedBy(homeOffice)) {
		return getCategory('Home Office', getHomeOfficeSubCategory(payer))
	} if (payerMatchedBy(bank, payer)) {
		return getCategory('Bank', 'Commission')
	} if (payerMatchedBy(drinks)) {
		return getCategory('Drinks', 'Hot drinks')
	} if (payerMatchedBy(documents)) {
		return getCategory('Family', getFamilySubCategory(payer))
	}
	return { category: '', subCategory: '' }
}