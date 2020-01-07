const request = require('request');

const getRandomName3 = () => {
	return new Promise((resolve, reject) => {
		let url = "http://names.drycodes.com/1";

		try {
			request(url, function (err, response, body) {
				if (err) {
					console.log("Error occured in fetching a random name" + err);
					reject(err);
				} else {
					let rand_Name = JSON.parse(body);
					if (rand_Name == undefined) {
						console.log("Error occured in getting a random name");
						reject(err);
					} else {
						//console.log('name is ' + rand_Name);
						resolve(rand_Name[0]);
					}
				}
			});
		} catch (err) {
			console.log("Error in fetching name : " + err);
			reject(err);
		}
	})
};

exports.getRandomName2 = getRandomName3;