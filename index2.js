const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs')

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
    let splitted = period.split("~")
    let from = splitted[0]
    let to = splitted[1]

    let res = []

    // 1. 2022. 10. 4. ~ 12. 31.
    const pattern1 = /^\d{4}. \d{1,2}. \d{1,2}. ~ \d{1,2}. \d{1,2}.$/
    // 2. 2022. 9. 23. ~ 2023. 1. 14.
    const pattern2 = /^\d{4}. \d{1,2}. \d{1,2}. ~ \d{1,4}. \d{1,2}. \d{1,2}.$/
    // 3. 2022. 10. 1. ~ 30.
    const pattern3 = /^\d{4}. \d{1,2}. \d{1,2}. ~ \d{1,2}.$/
    // 7. 2022. 10. 23. / 10:00 ~ 17:00
    const pattern7 = /^\d{4}. \d{1,2}. \d{1,2}. \/ \d{1,2}:\d{1,2}\s{0,}~|-\s{0,}\d{1,2}:\d{1,2}$/
    // 4. 2022. 10. 27. ~ 30. / 11:00~19:00
    // 4. 2022. 10. 21. ~ 25. / 10:00~18:00
    const pattern4 = /^\d{4}. \d{1,2}. \d{1,2}. ~ \d{1,2}. \/ \d{1,2}:\d{1,2}\s{0,}~|-\s{0,}\d{1,2}:\d{1,2}\s{0,}.*$/
    // 5. 2022. 9. 7. ~ 10. 20. / 10:00~17:00
    const pattern5 = /^\d{4}. \d{1,2}. \d{1,2}. ~ \d{1,2}. \d{1,2}. \/ \d{1,2}:\d{1,2}\s{0,}~\s{0,}\d{1,2}:\d{1,2}$/
    // 6. 2022. 10. 15.
    const pattern6 = /^\d{4}. \d{1,2}. \d{1,2}.$/

    switch (true) {
        case pattern1.test(period):
            res[0] = from.trim()
            res[1] = from.substring(0, 5).concat(to).trim()
            break
        case pattern2.test(period):
            res[0] = splitted[0].trim()
            res[1] = splitted[1].trim()
            break
        case pattern3.test(period):
            res[0] = from.trim()
            const tmp3 = res[0].split(" ")
            res[1] = tmp3[0].concat(" ").concat(tmp3[1]).concat(to).trim()

            break
        case pattern7.test(period):
            const tmp7 = period.split(/\s{0,}\/\s{0,}/)
            const endTime = tmp7[1].split(/\s{0,}~|-\s{0,}/)[1]
            res[1] = tmp7[0].concat((endTime[0] === " " ? "" : " ") + endTime)
            break
        case pattern4.test(period):
            let tmp4 = period
            if (period.length > 35) tmp4 = period.split("(")[0]

            const splitPat4 = tmp4.split(" / ")
            const datesPat4 = splitPat4[0].split("~")
            let tmp41 = datesPat4[0].split(" ")
            const timesPat4 = splitPat4[1].split(/-|~/)

            res[0] = datesPat4[0].concat(timesPat4[0]).trim()
            res[1] = tmp41[0]
                .concat(" " + tmp41[1])
                .concat(datesPat4[1])
                .concat((timesPat4[1][0] === " " ? "" : " ") + timesPat4[1])
                .trim()
            break
        case pattern5.test(period):
            // console.log("pattern5 " + period)
            const splitPat5 = period.split(" / ")
            const datesPat5 = splitPat5[0].split("~")
            const timesPat5 = splitPat5[1].split("~")

            res[0] = datesPat5[0].concat(timesPat5[0]).trim()
            res[1] = datesPat5[0]
                .substring(0, 5)
                .concat(datesPat5[1])
                .concat(" " + timesPat5[1])
                .trim()
            break
        case pattern6.test(period):
            res[1] = splitted[1]
            break
    }

    return res
}

const datasIntoJson = async () => {
    const detailUrlList = await fillDetailUrlArr()
    // json 결과물들을 담을 배열
    let result = []

    for (url of detailUrlList) {
        const html = await getHTML(url)
        const $ = cheerio.load(html.data)
        const fromTo = periodToFromTo($("dd:nth-child(4)").text().replace(/\t|\n/g, ""))
        const addr = $("dd:nth-child(2)").text()

        result.push({
            thmb: "https://mcst.go.kr" + $(".culture_view_img img").attr("src"),
            thmb_alt: $(".culture_view_img img").attr("alt"),
            acti_cd: "A02",
            addr_nm: addr.substring(4, addr.length),
            str_addr: $("dd:nth-child(10)").text(),
            ttl: $(".view_title").text(),
            rpr_dsc: $(".viewWarp > .view_con").text().replace(/\t|\n/g, ""),
            orgn_site: $(".full .link").text(),
            opr_prd_from: fromTo[0] === undefined ? null : fromTo[0],
            opr_prd_to: fromTo[1] === undefined ? null : fromTo[1],
        })
    }

    return result
}

const main = async () => {
    const temp = await datasIntoJson()
    const client = axios.create({
        headers: {
            "Content-Type": "application/json",
        },
    })
    fs.writeFile("./crawl-js.json", JSON.stringify(temp), 'utf-8', function (err) {
        if (err) {
            return console.log(err)
        }
        console.log('file saved')
    })
    // console.log(temp)
    // client.post("http://43.200.180.72/contentAddJson", JSON.stringify(temp))
    // client.post("http://127.0.0.1/contentAddJson", JSON.stringify(temp))
}

main();