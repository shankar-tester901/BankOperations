const catalyst = require("zcatalyst-sdk-node");

const fetchRandomName = require('./genRandomNames');
const fetchRandomAmount = require('./genRandomAmt');
//const getTotal = require('./getTotal');
/**
 * This function adds money to an account 
 */
module.exports = (context, basicIO) => {
	const app = catalyst.initialize(context);



	//Use Table Meta Object to insert the row which returns a promise
	let datastore = app.datastore();
	let table = datastore.table('Transactions');
	var rand_Name = '';
	var rand_Number = 0;
	var total = 0;




	fetchRandomAmount.getRandomAmount4().then(fetchResult => {
		var rand_Number_String = JSON.stringify(fetchResult);
		rand_Number = Number(rand_Number_String);
		console.log('number is ...... ' + rand_Number);
	}).then(() => {

		fetchRandomName.getRandomName2().then(setName => {
			rand_Name = JSON.stringify(setName).toString();
			console.log('name is ..... ' + rand_Name);
		}).then(() => {

			let zcql = app.zcql();
			let zcqlPromise = zcql.executeZCQLQuery("SELECT total FROM Transactions ORDER BY createdtime DESC LIMIT 1");
			zcqlPromise.then(queryResult => {
				console.log(queryResult.length);
				if (queryResult.length == 0) {

					let rowData =
					{
						name: rand_Name,
						amt: rand_Number,
						type: 2,
						total: rand_Number

					};
					console.log(rowData);
					let insertPromise = table.insertRow(rowData);
					insertPromise.then((row) => {
						console.log(row);
						context.close();
					}).catch((err1) => {
						console.log("Error1 is " + err1);
						reject(err1);
					});
				}
				var oldTotal = queryResult[0].Transactions.total;
				console.log('--- old total    ' + oldTotal);
				total = Number(oldTotal) - Number(rand_Number);
				console.log('----- new total is ' + total);
			}).then(dbtotal => {

				let rowData =
				{
					name: rand_Name,
					amt: rand_Number,
					type: 2,
					total: total

				};
				console.log(rowData);
				let insertPromise = table.insertRow(rowData);
				insertPromise.then((row) => {
					console.log(row);
					basicIO.write(JSON.stringify(row));
					context.close();
				}).catch((err1) => {
					console.log("Error1 is " + err1);
					reject(err1);
				});
			}).catch((err4) => {
				console.log("Error4 is " + err4);
				reject(err4);
			});
		}).catch((err3) => {
			console.log("Error3 is " + err3);
			reject(err3);
		});

	}).catch((err2) => {
		console.log("Error2 is " + err2);
		reject(err2);
	});

}