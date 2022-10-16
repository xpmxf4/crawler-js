const cheerio = require('cheerio');
const axios = require('axios');
const client = axios.create({
    headers: {
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
    }
})

// HTML 문서 불러오기
const getHTML = async () => {
    try {
        return await client.get(
            'https://www.mcst.go.kr/kor/s_culture/festival/festivalList.jsp?pSeq=&pRo=&pCurrentPage=1&pOrder=01up&pPeriod=&fromDt=&toDt=&pSido=01&pSearchType=01&pSearchWord='
        );
    } catch (err) {
        console.log(err);
    }
}

// 축제 원본 사이트 링크 따오기
const getOriginURL = async (href) => {
    const html = await client.get(href);
    const $ = cheerio.load(html.data);
    const aTag = $('.full a');
    const result = $(aTag[0]).attr('href');

    return result;
}

// HTML -> JSON
const parsing = async () => {
    const html = await getHTML();
    const $ = cheerio.load(html.data);
    const festivalList = $('.color01 li');

    let courses = [];
    festivalList.each(async (_idx, node) => {
        // title 이 없으면 걸러야 하는 node 
        const title = $(node).find('.title').text();
        if (title === '') return;

        // 상세 페이지에서, 회사가 만든 축제 홈페이지 링크 따오기
        const detail_url = 'http://www.mcst.go.kr/kor/s_culture/festival/' + $(node).find('a').attr('href');
        const res = await getOriginURL(detail_url);

        // courses 에 다 넣기
        courses.push({
            title: $(node).find('.title').text(),
            desc: $(node).find('.ny').text().replace('\n', ' '),
            period: $(node).find('.detail_info li:nth-child(1)').text().split('기간 :')[1],
            location: $(node).find('.detail_info li:nth-child(2)').text().split('장소 :')[1],
            inquiry: $(node).find('.detail_info li:nth-child(3)').text().replace(/\t|\n/g, '').split('문의 : ')[1],
            img_url: 'www.mcst.go.kr' + $(node).find('img').attr('src'),
            origin_url: res,
        })

        // courses 들 다 채우면, return 하기
        if (courses.length === 5) {
            console.log(courses);
            return courses;
        }
    });
}


module.exports = parsing;