var express = require('express');
const app = express();

var axios = require('axios');

app.get('/', (req, res) => {
	console.log('---remove ---');
	axios.get('https://bankops2-696722811.development.zohocatalyst.com/baas/v1/project/343000000020045/function/remove_money/execute')
		.then(result => {
			console.log(result.data.output);
			res.json(result.data.output);
		})
		.catch(error => {
			console.error("Error is " + error)
		})


})


console.log('Starting server in 9001');
app.listen('9001');	