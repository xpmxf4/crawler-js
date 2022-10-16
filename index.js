const parsing = require('./parsing')
const jsonToCSV = require('./jsonToCSV')
const fs = require('fs')

const main = async () => {
    const json_data = await parsing();
    fs.writeFileSync('./test.csv', result);
}

main()