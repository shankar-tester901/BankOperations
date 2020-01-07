const request = require('request');
var random_amt = 0;

const getRandomAmount4 = () => {
	return new Promise((resolve, reject) => {

		let url = "https://csrng.net/csrng/csrng.php?min=0&max=100";

		try {

			request(url, function (err, response, body) {

				if (err) {
					console.log("Error occured in fetching a random number" + err);
					reject(err);
				} else {
					let rand_Num = JSON.parse(body);
					//	console.log(rand_Num);
					if (rand_Num == undefined) {
						console.log("Error occured in getting a random number");
						reject(err);
					} else {
						random_amt = rand_Num[0].random;
						//	console.log('number is ' + random_amt);
						resolve(random_amt);
					}
				}
			});
		} catch (err) {
			console.log("Error in fetching number : " + err);
			reject(err);
		}
	})
};


exports.getRandomAmount4 = getRandomAmount4;