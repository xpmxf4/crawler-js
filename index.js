const cheerio = require('cheerio');
const axios = require('axios');
const client = axios.create({
    headers: {
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
    }
})

const getHTML = async () => {
    try {
        return await client.get(
            'https://www.mcst.go.kr/kor/s_culture/festival/festivalList.jsp?pSeq=&pRo=&pCurrentPage=1&pOrder=01up&pPeriod=&fromDt=&toDt=&pSido=01&pSearchType=01&pSearchWord='
        );
    } catch (err) {
        console.log(err);
    }
}

const getOriginURL = async (href) => {
    const html = await client.get(href);
    const $ = cheerio.load(html.data);
    const aTag = $('.full a');
    const result = $(aTag[0]).attr('href');

    return result;
}

const parsing = async () => {
    const html = await getHTML();
    const $ = cheerio.load(html.data);
    const festivalList = $('.color01 li');

    let courses = [];
    festivalList.each((_idx, node) => {
        const title = $(node).find('.title').text();
        if (title === '') return;
        const detail_url = 'http://www.mcst.go.kr/kor/s_culture/festival/' + $(node).find('a').attr('href');
        getOriginURL(detail_url).then((res) => {
            courses.push({
                title: $(node).find('.title:eq(0)').text(),
                desc: $(node).find('.ny').text().replace('\n', ' '),
                detail_infos: $(node).find('.detail_info li').text().replace('\t', ' '),
                img_url: 'www.mcst.go.kr' + $(node).find('img').attr('src'),
                originURL: res,
            })
        });
    });


    console.log(courses);
}

parsing();