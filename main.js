const express = require('express')
const path = require('path')
const url = require('url')
const cityConverter = require('./cityConverter')

const app = express()
const port = 8081

const getHttpErrorHandler = response => err => {
	console.error(err)
	response.status(500).send('Something is broken. Details: ' + err)
}
app.use((err, request, response, next) => getHttpErrorHandler(response)(err))

app.get('/convert', (request, response) => {
	const filePath = request.query.path;
	if (filePath) {
		const responseErrorHandler = getHttpErrorHandler(response)
		console.log('Request to convert file name ' + filePath + ' is received')
		cityConverter
			.convertCvsFile(filePath, responseErrorHandler)
			.on('finish', () => response.end())
			.on('error', responseErrorHandler)
			.pipe(response)
	} else {
		response.status(400).send('File name is not provided in path attribute')
	}
})

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(port, err => {
	if (err) {
		return console.error(err)
	}
	console.log(`City to ExpenseManager converter is running at http://127.0.0.1:${port}/`)
})
