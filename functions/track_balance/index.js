module.exports = (cronDetails, context) => {
	console.log('Hello from index.js');
	const app = catalyst.initialize(context);


	let thisCronDetails = cronDetails.getCronDetails('343000000020837');

	let zcql = app.zcql();
	let zcqlPromise = zcql.executeZCQLQuery("select total from Transactions");
	zcqlPromise.then(queryResult => {
		var total_Value = queryResult[0].Transactions.total;
		console.log(total_Value);

		if (total_Value < 50) {

			//Create a config object with the email configuration
			let config = {
				from_email: 'shankarr+1003@zohocorp.com',
				to_email: 'shankarr+1003@zohocorp.com',
				subject: 'Low Total Balance in Transactions',
				content: "Total in Transactions is less than 50"
			};

			//Send the mail by passing the config object to the method which in turn returns a promise
			let email = app.email();
			let mailPromise = email.sendMail(config);
			mailPromise.then((mailObject) => {
				console.log(mailObject);
			});

		}

	});

	context.endWithSuccess();
};
