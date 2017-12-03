const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload');
const cityConverter = require('./cityConverter')

const app = express()
const port = 8081

const getHttpErrorHandler = response => err => {
	console.error(err)
	response.status(500).send('Something is broken. Details: ' + err)
}
app.use((err, request, response, next) => getHttpErrorHandler(response)(err))
app.use(fileUpload())

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, 'index.html'))
})

const getCategoriesMapping = (file = {}) => file.data && JSON.parse(file.data)

app.post('/', ({files}, response) => {
	if (files && files.file) {
		cityConverter
			.convertCvsFileData(files.file.data, getCategoriesMapping(files.categoriesMapping))
			.on('finish', () => response.end())
			.on('error', getHttpErrorHandler(response))
			.pipe(response);
	} else {
		response.status(400).send('No file was uploaded.')
	}
})

app.listen(port, err => {
	if (err) {
		return console.error(err)
	}
	console.log(`City to ExpenseManager converter is running at http://127.0.0.1:${port}/`)
})
