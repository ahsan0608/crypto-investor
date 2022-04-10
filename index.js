const args = require('yargs').argv;
const axios = require('axios');
const readLine = require('readline');

// TOKEN INPUT
// ALL INPUT
var getPortfolioValForAToken = (token,date) => new Promise(function (resolve) {

    var outputArr = { "token": "", "amount": 0, "timestamp": 0 };
    var lineReader = csvLineReader();

    lineReader.on('line', function (line) {

        var jsonFromLine = {};
        var lineSplit = line.split(',');

        splitCSVcolumns(jsonFromLine, lineSplit);

        if(date != undefined){
            var timeStampToDate = dateFromTimestamp(jsonFromLine);
            if (jsonFromLine.token === token && (timeStampToDate.localeCompare(date) == 0)) {
                outputArr.token = jsonFromLine.token;
                if(jsonFromLine.transaction_type=="DEPOSIT"){
                    outputArr.amount += parseFloat(jsonFromLine.amount);
                } else {
                    outputArr.amount -= parseFloat(jsonFromLine.amount);
                }
                outputArr.timestamp = date;
            }
        } else{
            if (jsonFromLine.token === token) {
                if (jsonFromLine.timestamp > outputArr.timestamp) {
                    outputArr.token = jsonFromLine.token;
                    outputArr.amount = jsonFromLine.amount;
                    outputArr.timestamp = jsonFromLine.timestamp;
                }
            }
        }
    });

    lineReader.on('close', function () {
        cryptoCompare = getUSDValues();
        cryptoCompare.then(function (result) {
            usdValues = result;
            outputArr.amount = outputArr.amount * usdValues.ETH.USD;
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

    var btcArr = { "token": "BTC", "amount": 0, "timestamp": 0 };
    var ethArr = { "token": "ETH", "amount": 0, "timestamp": 0 };
    var xrpArr = { "token": "XRP", "amount": 0, "timestamp": 0 };

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
                element.amount = element.amount * usdValues.ETH.USD;
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
            btcArr.amount += parseFloat(jsonFromLine.amount);
        } else {
            btcArr.amount -= parseFloat(jsonFromLine.amount);
        }
        btcArr.timestamp = date;

    } else if (jsonFromLine.token === 'ETH' && (timeStampToDate.localeCompare(date) == 0)) {
        if (jsonFromLine.transaction_type == "DEPOSIT") {
            ethArr.amount += parseFloat(jsonFromLine.amount);
        } else {
            ethArr.amount -= parseFloat(jsonFromLine.amount);
        }
        ethArr.timestamp = date;

    } else if (jsonFromLine.token === 'XRP' && (timeStampToDate.localeCompare(date) == 0)) {
        if (jsonFromLine.transaction_type == "DEPOSIT") {
            xrpArr.amount += parseFloat(jsonFromLine.amount);
        } else {
            xrpArr.amount -= parseFloat(jsonFromLine.amount);
        }
        xrpArr.timestamp = date;
    }
}

function setValuePerToken(jsonFromLine, ethArr, btcArr, xrpArr) {
    if (jsonFromLine.token === 'ETH') {
        if (jsonFromLine.timestamp > ethArr.timestamp) {
            ethArr.token = jsonFromLine.token;
            ethArr.amount = jsonFromLine.amount;
            ethArr.timestamp = jsonFromLine.timestamp;
        }
    }
    else if (jsonFromLine.token === 'BTC') {
        if (jsonFromLine.timestamp > btcArr.timestamp) {
            btcArr.token = jsonFromLine.token;
            btcArr.amount = jsonFromLine.amount;
            btcArr.timestamp = jsonFromLine.timestamp;
        }
    }
    else if (jsonFromLine.token === 'XRP') {
        if (jsonFromLine.timestamp > xrpArr.timestamp) {
            xrpArr.token = jsonFromLine.token;
            xrpArr.amount = jsonFromLine.amount;
            xrpArr.timestamp = jsonFromLine.timestamp;
        }
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
    console.log("NO PARAMETERS!, returning the latest portfolio value per token in USD");
    getPortfolioValPerTokenInUSD(args.token,args.date).then((result) => { 
        console.log(result); 
    });
}
else if (args.date != undefined && args.token === undefined){
    console.log("A DATE!, returning the portfolio value per token in USD on that date");
    getPortfolioValPerTokenInUSD(args.token,args.date).then((result) => {
        console.log(result);
    });
    
}
else if (args.token != undefined && args.date === undefined){
    console.log("A TOKEN!, returning the latest portfolio value for that token in USD");
    getPortfolioValForAToken(args.token,args.date).then((result) => {
        console.log(result);
        });
}
else if (args.token != undefined && args.date != undefined){
    console.log("A TOKEN and A DATE!, returning the portfolio value of that token in USD on that date");
    getPortfolioValForAToken(args.token,args.date).then((result) => {
        console.log(result);
    });

}