
    var output = [];

    var outputArr = { "token": "", "amount": 0, "timestamp": 0 };

    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('transactions.csv')
    });

    lineReader.on('line', (line) => {

            var lineObject = {};
            var lineSplit = line.split(',');

            // console.log(lineSplit);

            lineObject.timestamp = lineSplit[0];
            lineObject.transaction_type = lineSplit[1];
            lineObject.token = lineSplit[2];
            lineObject.amount = lineSplit[3];

            if (lineObject.token === 'ETH') {
                if (lineObject.timestamp > outputArr.timestamp) {
                    outputArr.token = lineObject.token;
                    outputArr.amount = lineObject.amount;
                    outputArr.timestamp = lineObject.timestamp;
                }
            }
            else if (lineObject.token === 'BTC') {
                if (lineObject.timestamp > outputArr.timestamp) {
                    outputArr.token = lineObject.token;
                    outputArr.amount = lineObject.amount;
                    outputArr.timestamp = lineObject.timestamp;

                }
            }
            else if (lineObject.token === 'XRP') {
                if (lineObject.timestamp > outputArr.timestamp) {
                    outputArr.token = lineObject.token;
                    outputArr.amount = lineObject.amount;
                    outputArr.timestamp = lineObject.timestamp;
                }
            }
        }

    );
    lineReader.on('close', (line) => {
            console.log(outputArr)
        });