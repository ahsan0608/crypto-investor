Here, solutions have been sought for a total of four scenarios. I first tried to simplify the matter by finding similarities between these four questions. I noticed that in the command line when no input is given and when only date is given as input, the portfolio value in USD is asked for each token in these two cases. To solve this case I need one object for each token. So I write a function where I declare the objects at the beginning for all types of tokens. Then I call a function to read the CSV file line by line with the help of the "readline" module. I separate the two cases by checking the input parameters of this function. While reading each line, I calculate the portfolio value by adding "DEPOSIT" and subtracting "WITHDRAWAL" considering the "transaction type" and calculate the portfolio value from "cryptocompare" api with the help of "axios" module and convert the portfolio value to USD. Then I set the data to the object specified for the tokens. After reading all the lines, I push the objects in an array for returning the function output.

The other two scenarios, one with only a token and the other with a date input with a token, asked for a portfolio value in USD for that token. For this scenario I write a function where I declare a common object for a token. Then read the CSV file line by line as before. Considering the input parameters of the function, I process the data separately for this two cases. Then convert the portfolio value to USD and return it.

I used the "yargs" module to read the input value directly from the command line. Then considering this input value I got the desired output by calling the above functions in a total of four conditions for four cases.

 - - - -

Below are four testcases for the four scenarios.

* Given no parameters, return the latest portfolio value per token in USD
   * `node index.js`
* Given a token, return the latest portfolio value for that token in USD
   * `node index.js --token=BTC`
* Given a date, return the portfolio value per token in USD on that date
   * `node index.js --date=25/10/2019`
* Given a date and a token, return the portfolio value of that token in USD on that date
   * `node index.js --date=25/10/2019 --token=BTC`
         
  
