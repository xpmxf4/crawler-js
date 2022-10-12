const axios = require('axios');
const cheerio = require('cheerio');

async function main() {
    const res = await axios.get(
        'https://yjiq150.github.io/coronaboard-crawling-sample/dom'
    )

    const $ = cheerio.load(res.data);
    const elements = $('.slide');

    elements.each((idx, el) => {
        console.log($(el).toString());
    })
}

main();