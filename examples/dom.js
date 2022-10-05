const axios = require('axios');
const cheerio = require('cheerio');

async function main(){
	// 1. HTML �ε��ϱ�
	const resp = await axios.get(
			'https://yjiq150.github.io/coronaboard-crawling-sample/dom'
			);

	const $ = cheerio.load(resp.data);	// 2. HTML �� �Ľ��ϰ� DOM �����ϱ�
	const elements = $('.slide');		// 3. CSS �����ͷ� ���ϴ� ��� ã��

	// 4. ã�� ��Ҹ� ��ȸ�ϸ鼭 ��Ұ� ���� �ؽ�Ʈ�� ����ϱ�
	elements.each((idx, el) => {
			// 5. text() �޼��带 ����ϱ� ������ Node ��ü�� el �� $ �� ���μ� cheerio ��ü�� ��ȯ
			console.log($(el).text());
	});
}

main();
