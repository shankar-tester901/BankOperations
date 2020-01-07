# BankOperations

FaaS example using Zoho Catalyst. This example mimics  simplistic banking transactions.


Let us simulate a bank transaction. So in our project we will do 3 things 

A. Add money to a bank acct

B. Remove money from the bank acct

C. Check the balance of the bank acct

Remember, there is no client. We just need to invoke the APIs alone to test this.

Let us first build it in Catalyst.



So login to at catalyst.zoho.com and create a new project. Let us call it BankOps.

Now go to the command line and create a folder bankops

Then cd to the bankops folder.

Run catalyst init

Choose Functions

Choose the project BankOps

That is it

Now you will find a structure like this inside the bankops folder.

catalyst.json	functions





Cd functions



Now we have an empty folder. Now we need to create a folder for each API that we need to make.

So type as follows -



shankarr-0701@shankarr-0701 functions % catalyst functions:add



===> Functions Setup

 which type of function do you like to create ? (Use arrow keys)

❯ BasicIO 

  Event 

  Cron 





Choose BasicIO

 Which stack do you prefer to write your function? (Use arrow keys)

❯ node10 

  java8 









Choose node10



Now you will need to give the name of the API. Let us choose to give it as add_money.

Then just click on Enter for the rest and voila!, you have a folder with some default code ready.



catalyst-config.json	index.js		node_modules		package-lock.json	package.json



Let us now create a table called as Transactions.

This table will have the following columns -



Total

Name

Amt

Type







Now let us proceed to put some substance in our index.js file. This is the heart of the process. This will be the main file to be invoked as the API.

This is how it looks.





module.exports = (context, basicIO) => {

    /* 

        BASICIO FUNCTIONALITIES

    */

    basicIO.write('Hello from index.js'); //response stream (accepts only string, throws error if other than string)

    basicIO.getArgument('argument1'); // returns QUERY_PARAM[argument1] || BODY_JSON[argument1] (takes argument from query and body, first preference to query)

    /* 

        CONTEXT FUNCTIONALITIES

    */

    console.log('successfully executed basicio functions');

    context.close(); //end of application

};





A little explanation will be useful.



The input to the program is the context and basicIO parameters. 

Whatever you need to do, you have to refer these two parameters only. They are our two levers to change the world.



So in the add_money API, we must add money to the Transactions table.

Now we will use a little variation.



Generally bank accts are held by specific individuals. In our case, since it is a sample program, we will generate random names and also random amounts which will be used to add entries to the table.

So this will mimic a world-wide operation ;-).





So let us then work on generating Random Names first and then Random Amounts.



Inside the add_money folder, create a file genRandomNames. Inside that copy the below code :-



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









So let me explain the code. 



We are using the request module to make a call to drycodes.com to get random names.

Note that we are actually invoking all this within a function getRandomNames3.

This function is exposed via another constant getRandomName2.





That is all to it.



Let us now create another file genRandomAmt.js. Copy the following code into it.



const request = require('request');

var random_amt = 0;



const getRandomAmount4 = () => {

    return new Promise((resolve, reject) => {



        let url = "https://csrng.net/csrng/csrng.php?min=0&max=10";



        try {



            request(url, function (err, response, body) {



                if (err) {

                    console.log("Error occured in fetching a random number" + err);

                    reject(err);

                } else {

                    let rand_Num = JSON.parse(body);

                    //  console.log(rand_Num);

                    if (rand_Num == undefined) {

                        console.log("Error occured in getting a random number");

                        reject(err);

                    } else {

                        random_amt = rand_Num[0].random;

                        //  console.log('number is ' + random_amt);

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





It is almost the exact same logic as in the previous code for generating Random Names.



So now, let us include these files into the index.js file and then proceed to write the code.

The index.js looks like this once we have all the codes in place. 



const catalyst = require("zcatalyst-sdk-node");

const request = require('request');

const fetchRandomName = require('./genRandomNames');

const fetchRandomAmount = require('./genRandomAmt');









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

                //  console.log(queryResult.length);

                if (queryResult.length == 0) {



                    let rowData =

                    {

                        name: rand_Name,

                        amt: rand_Number,

                        type: 1,

                        total: rand_Number



                    };

                    console.log(rowData);

                    let insertPromise = table.insertRow(rowData);

                    insertPromise.then((row) => {

                        console.log(' in insertrow now ');

                        console.log(row);

                        context.close();

                    }).catch((err1) => {

                        console.log("Error1 is " + err1);

                        reject(err1);

                    });

                }

                var oldTotal = queryResult[0].Transactions.total;

                total = Number(oldTotal) + Number(rand_Number);

                console.log('--- old total    ' + oldTotal + ' ----- new total is ' + total);

            }).then(dbtotal => {



                let rowData =

                {

                    name: rand_Name,

                    amt: rand_Number,

                    type: 1,

                    total: total



                };

                //  console.log(rowData);

                let insertPromise = table.insertRow(rowData);

                insertPromise.then((row) => {

                    //      console.log(row);

                    basicIO.write("Row added is " + JSON.stringify(row))

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





This requires some explanation. So here goes -



We need reference to the catalyst sdk. So we included that.

Then we need references to the genRandomNames and genRandomAmt files. So we included that.



Then we get reference to the Transactions table as we need to run our operations on it.



We first generate a random amount and then generate a random name.

Once we get these, we check for the value of the total column in the Transactions table.

If there are no rows, then it means that this will be the first entry.

So we insert a row with the random name, random amt and type as 2 for showing money addition.



If there are existing rows, then we get the value of the total.

Then we add the random amt generated to the total.



And then insert another row to the Transactions table with type as 2.



Again, as we are solely working on the server side, we need to ensure that all our packages are imported properly.

So go to the add_money folder and add all the packages needed like express, require, catalyst-sdk-node etc using nam install —-save xbyzdd command



LET US NOW TEST IT



Go to the functions  folder and run the following :- catalyst functions: shell



add_money()



functions > add_money()

[cli] Function has been invoked



number is ...... 82



name is ..... "System_Website"



--- old total    1579 ----- new total is 1661



Row added is {"CREATORID":343000000002003,"total":1661,"MODIFIEDTIME":"2019-12-24 03:17:09","name":"\"System_Website\"","amt":82,"CREATEDTIME":"2019-12-24 03:17:09","type":1,"ROWID":343000000043001}



[cli] Function execution complete



[response]

Row added is {"CREATORID":343000000002003,"total":1661,"MODIFIEDTIME":"2019-12-24 03:17:09","name":"\"System_Website\"","amt":82,"CREATEDTIME":"2019-12-24 03:17:09","type":1,"ROWID":343000000043001}

[status]

200

functions > 



This shows that the function is working well.



Look into the Transactions table in the Data View. You will see the entry.

Make a note of the Total column value for the last entry.





Now let us deploy it as usual. It might take say 30secs before you see any response. That is normal.



shankarr-0701@shankarr-0701 functions % catalyst deploy





ℹ functions(add_money): URL => https://bankops2-696722811.development.zohocatalyst.com/baas/v1/project/343000000020045/function/add_money/execute

✔ functions(add_money): deploy successful









For sake of testing this in live, just load the https://bankops2-696722811.development.zohocatalyst.com/baas/v1/project/343000000020045/function/add_money/execute

 Url in a browser and hit enter. You will find details of the transaction shown in the browser window.

Now go and check in the Transactions table. You will find a new entry (same as in the browser window) and the Total value updated.



So there you go. You have your own API -  https://bankops2-696722811.development.zohocatalyst.com/baas/v1/project/343000000020045/function/add_money/execute



The great thing now is that for anyone needs to just invoke this url/API in their own program. Check out the test programs attached.



Similarly we do for remove_money as well.

The code is as follows.



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

                    basicIO.write("Row -- " + JSON.stringify(row));

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



The method for testing and deployment are all the same as for add_money.
