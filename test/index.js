const DomesticCrawler = require('./domestic-crawler.js');

async function main() {
	try {
		const domesticCrawler = new DomesticCrawler();
		const result = await domesticCrawler.crawlStat();
		console.log(result);
	} catch (e) {
		console.error('crawlStat failed', e);
	}
}

main();