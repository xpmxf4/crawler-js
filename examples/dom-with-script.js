const axios = require('axios');
const cheerio = require('cheerio');
// 1. 추출된 자바스크립트 코드를 별도 실행하는 가상 환경 기능 로드
const vm = require('vm');

async function main(){
	const resp = await axios.get(
			'https://yjiq150.github.io/coronaboard-crawling-sample/dom-with-script',
			);

	const $ = cheerio.load(resp.data);
	// 2. script 태그를 찾아서 코드 추출
	const extractedCode =$('script').first().html();
	const test = $('script').text();
	console.log("test = " + test);

	// 3. 컨텍스트(코드가 실행되면서 생성한 변수나 값들이 저장되는 공간) 를 생성 후, 해당 컨텍스트에서 추출된 코드 실행
	const context = {};
	vm.createContext(context);
	vm.runInContext(extractedCode, context);

	// 4. 스크립트 내에 하드코딩된 정보에 접근
	console.log("context.dataExample.content = "+context.dataExample.content);
}

main();
