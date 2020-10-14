const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload');
const { normalizeCategories } = require("./mappingNormalizer");
const cityConverter = require('./converters/cityConverter')
const pkoConverter = require('./converters/pkoConverter')
const nestConverter = require('./converters/nestConverter')

const app = express()
const port = process.env.PORT || 3000

const getHttpErrorHandler = response => err => {
	console.error(err)
	response.status(500).send('Something is broken. Details: ' + err)
}
app.use((err, request, response, next) => getHttpErrorHandler(response)(err))
app.use(fileUpload())

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, 'index.html'))
})

const getCategoriesMapping = (file = {}) => normalizeCategories(file.data && JSON.parse(file.data))

function selectConverter(bank) {
	switch (bank) {
		case 'pko': return pkoConverter
		case 'nest': return nestConverter
		default: return cityConverter
	}
}

app.post('/', ({ files, body: { bank } }, response) => {
	if (files && files.file) {
		const converter = selectConverter(bank)
		const csvFile = files.file;
		const originalFileName = csvFile.name.slice(0, -4)
		response.set({
			'Content-Type': 'text/plain; charset=utf-8',
			'Content-Disposition': `attachment; filename=${originalFileName}-converted.csv`
		})
		converter
			.convertCvsFileData(csvFile.data, getCategoriesMapping(files.categoriesMapping))
			.on('finish', () => setTimeout(() => response.end()))
			.on('error', getHttpErrorHandler(response))
			.pipe(response);
	} else {
		response.status(400).send('No file was uploaded.')
	}
})

const server = app.listen(port, err => {
	if (err) {
		return console.error(err)
	}
	console.info(`To ExpenseManager converter is running at http://${server.address().address}:${port}/`)
})
