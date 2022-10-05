const axios = require('axios');
const cheerio = require('cheerio');

async function main(){
	// 1. HTML 로드하기
	const resp = await axios.get(
			'https://yjiq150.github.io/coronaboard-crawling-sample/dom'
			);

	const $ = cheerio.load(resp.data);	// 2. HTML 을 파싱하고 DOM 생성하기
	const elements = $('.slide');		// 3. CSS 셀렉터로 원하는 요소 찾기

	// 4. 찾은 요소를 순회하면서 요소가 가진 텍스트를 출력하기
	elements.each((idx, el) => {
			// 5. text() 메서드를 사용하기 ㅜ이해 Node 객체인 el 을 $ 로 감싸서 cheerio 객체로 변환
			console.log($(el).text());
	});
}

main();
