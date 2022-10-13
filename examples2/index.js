const axios = require('axios');
const cheerio = require('cheerio');

// 'https://www.mcst.go.kr/kor/s_culture/festival/festivalList.jsp?pSeq=&pRo=&pCurrentPage=1&pOrder=01up&pPeriod=&fromDt=&toDt=&pSido=01&pSearchType=01&pSearchWord='
const getHTML = async () => {
    try {
        console.log('came in try block')
        return await axios.get('https://www.mcst.go.kr/kor/s_culture/festival/festivalList.jsp?pSeq=&pRo=&pCurrentPage=1&pOrder=01up&pPeriod=&fromDt=&toDt=&pSido=01&pSearchType=01&pSearchWord=')
    } catch (err) {
        console.log(err);
    }
}


const parsing = async () => {
    console.log('came in parsing func')
    const html = await getHTML();
    const $ = cheerio.load(html.data);
    const $festList = $('.color01 li');

    let festivals = [];

    $festList.each((idx, node) => {
        festivals.push({
            title: $(node).find('.title').text(),
            desc: $(node).find('.ny').text(),
            detail_infos: $(node).find('.detail_info').text(),
            link: $(node).find('.go').attr('href')
        })
    })

    console.log(festivals)
}

parsing();