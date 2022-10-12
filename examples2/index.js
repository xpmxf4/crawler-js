const cheerio = require('cheerio');
const axios = require('axios');

async function main() {
    const client = axios.create({
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
        }
    })
    const res1 = await client.get(
        'https://www.mcst.go.kr/kor/s_culture/festival/festivalList.jsp?pSeq=&pRo=&pCurrentPage=1&pOrder=01up&pPeriod=&fromDt=&toDt=&pSido=01&pSearchType=01&pSearchWord='
    );


    const $ = cheerio.load(res.data);
    const imgs = $('.color01 li img');
    const titles = $('.color01 li .text .title')
    const result = {};

    imgs.each((idx, el) => {
        console.log('mcst.go.kr' + $(el).attr('src'))
    });

    titles.each((idx, el) => {
        console.log($(el).text());
    });

}

main();