const args = require('yargs').argv;
const axios = require('axios')

var getPortfolioValPerToken = (date) => {
    return new Promise(function (resolve) {

        var output = [];

        var btcArr = { "token": "BTC", "amount": 0, "timestamp": 0 };
        var ethArr = { "token": "ETH", "amount": 0, "timestamp": 0 };
        var xrpArr = { "token": "XRP", "amount": 0, "timestamp": 0 };

        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('transactions.csv')
        });

        lineReader.on('line', (line) => {

            // console.log("line ",line); 25/10/2019

                var jsonFromLine = readLine(line);
                var timeStampToDate = dateFromTimestamp(jsonFromLine);
                // console.log("timeStampToDate.localeCompare(date) ",timeStampToDate.localeCompare(date));

                if (jsonFromLine.token === 'BTC' && (timeStampToDate.localeCompare(date) == 0)) {
                    if(jsonFromLine.transaction_type=="DEPOSIT"){
                        // console.log("btcArr.amount ",btcArr.amount);
                        btcArr.amount += parseFloat(jsonFromLine.amount);
                    } else {
                        // console.log("btcArr.amount ",btcArr.amount);
                        btcArr.amount -= parseFloat(jsonFromLine.amount);
                    }
                    btcArr.timestamp = date;

                } else if (jsonFromLine.token === 'ETH' && (timeStampToDate.localeCompare(date) == 0)) {
                    if(jsonFromLine.transaction_type=="DEPOSIT"){
                        ethArr.amount += parseFloat(jsonFromLine.amount);
                    } else {
                        ethArr.amount -= parseFloat(jsonFromLine.amount);
                    }
                    // console.log("ethArr.amount ",ethArr.amount);
                    ethArr.timestamp = date;

                } else if (jsonFromLine.token === 'XRP' && (timeStampToDate.localeCompare(date) == 0)) {
                    if(jsonFromLine.transaction_type=="DEPOSIT"){
                        xrpArr.amount += parseFloat(jsonFromLine.amount);
                    } else {
                        xrpArr.amount -= parseFloat(jsonFromLine.amount);
                    }
                    // console.log("xrpArr.amount ",xrpArr.amount);
                    xrpArr.timestamp = date;
                }
            }

        );
        lineReader.on('close', () => {

            output.push(ethArr);
            output.push(btcArr);
            output.push(xrpArr);

            // console.log("output ",output);

            cryptoCompare = getUSDValues();

            cryptoCompare.then(function (result) {
                usdValues = result;

                output.forEach(element => {
                    element.amount = element.amount * usdValues.ETH.USD;
                });

                resolve(output);
            }, function (err) {
                console.log(err);
            });
        });

        function readLine(line) {
            var jsonFromLine = {};
            var lineSplit = line.split(',');

            jsonFromLine.timestamp = lineSplit[0];
            jsonFromLine.transaction_type = lineSplit[1];
            jsonFromLine.token = lineSplit[2];
            jsonFromLine.amount = lineSplit[3];
            return jsonFromLine;
        }

    });
}

function dateFromTimestamp(jsonFromLine) {
    var d = new Date(jsonFromLine.timestamp * 1000);
    var dateFromCSV = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    return dateFromCSV;
}

async function getUSDValues() {
    var cryptoURL = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,DASH&tsyms=BTC,USD,EUR&api_key=3789ea397be622354552b3ab2a826e4379b5da952de997d3cff964ed4f0786ee';
    const response = await axios.get(cryptoURL);
    return Promise.resolve(response.data);
}

if (args.date != undefined && args.token === undefined){
    console.log("Return the portfolio value per token on a date");
    getPortfolioValPerToken(args.date).then((result) => {
        console.log(result);
    });
    
}