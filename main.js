const http = require('http')
const url = require('url')
const cityConverter = require('./cityConverter')

http.createServer((request, response) => {
	let reqUrl = url.parse(request.url, true);
	const pathname = reqUrl.pathname

	if (pathname === '/convert') {
		console.log('Request to convert file name ' + reqUrl.query.path + ' is received')
		cityConverter.convertCvsFile(reqUrl.query.path).pipe(response)
	} else {
		response.writeHead(400)
		response.write('File name is not provided in path')
		response.end();
	}
}).listen(8081)

console.log('City to ExpenseManager converter is running at http://127.0.0.1:8081/')