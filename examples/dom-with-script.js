const axios = require('axios');
const cheerio = require('cheerio');
// 1. ����� �ڹٽ�ũ��Ʈ �ڵ带 ���� �����ϴ� ���� ȯ�� ��� �ε�
const vm = require('vm');

async function main(){
	const resp = await axios.get(
			'https://yjiq150.github.io/coronaboard-crawling-sample/dom-with-script',
			);

	const $ = cheerio.load(resp.data);
	// 2. script �±׸� ã�Ƽ� �ڵ� ����
	const extractedCode =$('script').first().html();
	const test = $('script').text();
	console.log("test = " + test);

	// 3. ���ؽ�Ʈ(�ڵ尡 ����Ǹ鼭 ������ ������ ������ ����Ǵ� ����) �� ���� ��, �ش� ���ؽ�Ʈ���� ����� �ڵ� ����
	const context = {};
	vm.createContext(context);
	vm.runInContext(extractedCode, context);

	// 4. ��ũ��Ʈ ���� �ϵ��ڵ��� ������ ����
	console.log("context.dataExample.content = "+context.dataExample.content);
}

main();
