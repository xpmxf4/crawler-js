const cheerio = require('cheerio');
const axios = require('axios');

const URL_FOR_PAGE_LENGTH = 'http://www.mcst.go.kr/kor/s_culture/festival/festivalList.jsp?pSeq=&pRo=&pCurrentPage=1&pOrder=01up&pPeriod=&fromDt=&toDt=&pSido=01&pSearchType=01&pSearchWord='

const urlGenerator = (num) => {
    return 'http://www.mcst.go.kr/kor/s_culture/festival/festivalList.jsp?pMenuCD=&pCurrentPage=' + num + '&pSearchType=01&pSearchWord=&pSeq=&pSido=01&pOrder=02up&pPeriod=&fromDt=&toDt='
}

const client = axios.create({
    headers: {
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    }
})

const getHTML = async (href) => {
    try {
        return await client.get(href)
    } catch (err) {
        console.log(err)
    }
}

const getTotalPage = async () => {
    const html = await getHTML(URL_FOR_PAGE_LENGTH);

    const $ = cheerio.load(html.data)
    const paging = $('.contentWrap .pc a')
    pageLength = paging.length;

    return pageLength;
}

const fillDetailUrlArr = async () => {
    const pages = await getTotalPage();
    const pageUrlArr = [];
    const detailUrlList = [];

    for (let i = 1; i <= pages; i++) {
        pageUrlArr.push(urlGenerator(i))
    }

    // url 은 목록 페이지 
    for (url of pageUrlArr) {
        const html = await getHTML(url);
        const $ = cheerio.load(html.data);
        const festivals = $('.color01 li a');

        festivals.each((idx, el) => {
            detailUrlList.push('http://www.mcst.go.kr/kor/s_culture/festival/' + $(el).attr('href'));
        })
    }

    return detailUrlList;
}

const periodToFromTo = (period) => {
    // res[0] = from, res[1] = to
    let res = [];
    // 1. 2022. 10. 4. ~ 12. 31. 
    // 2. 2022. 9. 23. ~ 2023. 1. 14.
    // 3. 2022. 10. 1. ~ 30.
    // 4. 2022. 10. 27. ~ 30. / 11:00~19:00
    // 5. 2022. 10. 15.
    temp = period.split(' ~ ');
    console.log(temp);

    // case 5
    if (temp.length === 1) {
        res[1] = temp[0];
    }
    // case 2
    else if (temp[0].length === temp[1].length) {
        res[0] = temp[0];
        res[1] = temp[1];
    }
    else {
    }

    // console.log("2022. 9. 23.".replace(/ /g, ''));
    // console.log(new Date("2022. 9. 23.".replace(/ /g, '')))
    return res;
}

periodToFromTo('2022. 9. 23. ~ 2023. 1. 14.');

const datasIntoJson = async () => {
    const detailUrlList = await fillDetailUrlArr();
    // json 결과물들을 담을 배열
    let result = [];

    for (url of detailUrlList) {
        const html = await getHTML(url);
        const $ = cheerio.load(html.data);
        // console.log($('.full:nth-child(1))').text());

        result.push({
            thmb: 'https://mcst.go.kr' + $('.culture_view_img img').attr('src'),
            thmb_alt: $('.culture_view_img img').attr('alt'),
            ttl: $('.view_title').text(),
            rpr_dsc: $('.viewWarp > .view_con').text().replace(/\t|\n/g, ''),
            orgn_site: $('.full .link').text(),
            opr_prd_from: null,
            opr_prd_to: null,
        });
    }

    return result;
}

const main = async () => {
    const temp = await datasIntoJson()
    const client = axios.create({
        headers: {
            'Content-Type': 'application/json'
        }
    })

    client.post('http://172.30.1.36:7070/admin/activity/json', JSON.stringify(temp))
        .then(res => console.log(res.status))
}

// main();