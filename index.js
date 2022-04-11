const args = require('yargs').argv;
const axios = require('axios');
const readLine = require('readline');

// TOKEN INPUT
// ALL INPUT
var getPortfolioValForAToken = (token,date) => new Promise(function (resolve) {

    var outputArr = { "token": "", "portfolioValue": 0, "timestamp": 0 };
    var lineReader = csvLineReader();

    lineReader.on('line', function (line) {

        var jsonFromLine = readLineCSV(line);

        if(date != undefined){
            var timeStampToDate = dateFromTimestamp(jsonFromLine);
            if (jsonFromLine.token === token && (timeStampToDate.localeCompare(date) == 0)) {
                outputArr.token = jsonFromLine.token;
                if(jsonFromLine.transaction_type=="DEPOSIT"){
                    outputArr.portfolioValue += parseFloat(jsonFromLine.amount);
                } else {
                    outputArr.portfolioValue -= parseFloat(jsonFromLine.amount);
                }
                outputArr.timestamp = date;
            }
        } else{
            //TOKEN INPUT
            if (jsonFromLine.token === token) {
                    outputArr.token = jsonFromLine.token;
                    if(jsonFromLine.transaction_type=="DEPOSIT"){
                        outputArr.portfolioValue += parseFloat(jsonFromLine.amount);
                    } else {
                        outputArr.portfolioValue -= parseFloat(jsonFromLine.amount);
                    }
                    outputArr.timestamp = 'latest';
            }
        }
    });

    lineReader.on('close', function () {
        cryptoCompare = getUSDValues();
        cryptoCompare.then(function (result) {
            usdValues = result;
            outputArr.portfolioValue = outputArr.portfolioValue * usdValues.ETH.USD;
            resolve(outputArr);
        }, function (err) {
            console.log(err);
        });

    });
})

// NO INPUT
// DATE INPUT
var getPortfolioValPerTokenInUSD = (token,date) => new Promise(function (resolve) {

    var output = [];

    var btcArr = { "token": "BTC", "portfolioValue": 0, "timestamp": 0 };
    var ethArr = { "token": "ETH", "portfolioValue": 0, "timestamp": 0 };
    var xrpArr = { "token": "XRP", "portfolioValue": 0, "timestamp": 0 };

    var lineReader = csvLineReader();

    lineReader.on('line', (line) => {

        var jsonFromLine = readLineCSV(line);

        if(token === undefined && date === undefined){
            setValuePerToken(jsonFromLine, ethArr, btcArr, xrpArr);
        } else {
            var timeStampToDate = dateFromTimestamp(jsonFromLine);
            setValuePerTokenForDate(jsonFromLine, timeStampToDate, date, btcArr, ethArr, xrpArr);
        }
    }

    );
    lineReader.on('close', (line) => {

        output.push(ethArr);
        output.push(btcArr);
        output.push(xrpArr);

        cryptoCompare = getUSDValues();

        cryptoCompare.then(function (result) {
            usdValues = result;

            output.forEach(element => {
                element.portfolioValue = element.portfolioValue * usdValues.ETH.USD;
            });

            resolve(output);
        }, function (err) {
            console.log(err);
        });

        });
})


function setValuePerTokenForDate(jsonFromLine, timeStampToDate, date, btcArr, ethArr, xrpArr) {
    if (jsonFromLine.token === 'BTC' && (timeStampToDate.localeCompare(date) == 0)) {
        if (jsonFromLine.transaction_type == "DEPOSIT") {
            btcArr.portfolioValue += parseFloat(jsonFromLine.amount);
        } else {
            btcArr.portfolioValue -= parseFloat(jsonFromLine.amount);
        }
        btcArr.timestamp = date;

    } else if (jsonFromLine.token === 'ETH' && (timeStampToDate.localeCompare(date) == 0)) {
        if (jsonFromLine.transaction_type == "DEPOSIT") {
            ethArr.portfolioValue += parseFloat(jsonFromLine.amount);
        } else {
            ethArr.portfolioValue -= parseFloat(jsonFromLine.amount);
        }
        ethArr.timestamp = date;

    } else if (jsonFromLine.token === 'XRP' && (timeStampToDate.localeCompare(date) == 0)) {
        if (jsonFromLine.transaction_type == "DEPOSIT") {
            xrpArr.portfolioValue += parseFloat(jsonFromLine.amount);
        } else {
            xrpArr.portfolioValue -= parseFloat(jsonFromLine.amount);
        }
        xrpArr.timestamp = date;
    }
}

function setValuePerToken(jsonFromLine, ethArr, btcArr, xrpArr) {
    if (jsonFromLine.token === 'ETH') {
            ethArr.token = jsonFromLine.token;
            if(jsonFromLine.transaction_type=="DEPOSIT"){
                ethArr.portfolioValue += parseFloat(jsonFromLine.amount);
            } else {
                ethArr.portfolioValue -= parseFloat(jsonFromLine.amount);
            }
            ethArr.timestamp = 'latest';
    }
    else if (jsonFromLine.token === 'BTC') {
            btcArr.token = jsonFromLine.token;
            if(jsonFromLine.transaction_type=="DEPOSIT"){
                btcArr.portfolioValue += parseFloat(jsonFromLine.amount);
            } else {
                btcArr.portfolioValue -= parseFloat(jsonFromLine.amount);
            }
            btcArr.timestamp = 'latest';
    }
    else if (jsonFromLine.token === 'XRP') {
            xrpArr.token = jsonFromLine.token;
            if(jsonFromLine.transaction_type=="DEPOSIT"){
                xrpArr.portfolioValue += parseFloat(jsonFromLine.amount);
            } else {
                xrpArr.portfolioValue -= parseFloat(jsonFromLine.amount);
            }
            xrpArr.timestamp = 'latest';
    }
}

function splitCSVcolumns(jsonFromLine, lineSplit) {
    jsonFromLine.timestamp = lineSplit[0];
    jsonFromLine.transaction_type = lineSplit[1];
    jsonFromLine.token = lineSplit[2];
    jsonFromLine.amount = lineSplit[3];
}

function csvLineReader() {
    return readLine.createInterface({
        input: require('fs').createReadStream('transactions1.csv')
    });
}

function readLineCSV(line) {
    var jsonFromLine = {};
    var lineSplit = line.split(',');
    splitCSVcolumns(jsonFromLine, lineSplit);

    return jsonFromLine;
}

function dateFromTimestamp(jsonFromLine) {
    var d = new Date(jsonFromLine.timestamp * 1000);
    var dateFromCSV = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    return dateFromCSV;
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


if(args.token === undefined && args.date === undefined){
    console.log(`The latest portfolio value per token in USD is here:`);
    getPortfolioValPerTokenInUSD(args.token,args.date).then((result) => { 
        console.log(result); 
    });
}
else if (args.date != undefined && args.token === undefined){
    console.log(`The portfolio value per token in USD on ${args.date} is here:`);
    getPortfolioValPerTokenInUSD(args.token,args.date).then((result) => {
        console.log(result);
    });
    
}
else if (args.token != undefined && args.date === undefined){
    console.log(`The latest portfolio value for ${args.token} in USD is here:`);
    getPortfolioValForAToken(args.token,args.date).then((result) => {
        console.log(result);
        });
}
else if (args.token != undefined && args.date != undefined){
    console.log(`The portfolio value of ${args.token} in USD on ${args.date} is here:`);
    getPortfolioValForAToken(args.token,args.date).then((result) => {
        console.log(result);
    });

}