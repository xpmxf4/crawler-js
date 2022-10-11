const _ = require('lodash');
const axios = require('axios');
const cheerio = require('cheerio');

class DomesticCrawler {
	constructor() {
		this.client = axios.create({
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
			}
		});
	}

	async crawlStat() {
		const url = 'https://yjiq150.github.io/coronaboard-crawling-sample/clone/ncov/';
		const resp = await this.client.get(url);
		const $ = cheerio.load(resp.data);

		return {
			basicStats: this._extractBasicStats($),
			byAge: this._extractByAge($),
			bySex: this._extractBySex($),
		};
	}

	_extractBasicStats($) {
		let result = null;
		const titles = $('h5.s_title_in3');
		titles.each((i, el) => {
			const titleTextEl = $(el)
				.contents()
				.toArray()
				.filter((x) => x.type === 'text');

			if ($(titleTextEl).text().trim() === '누적 검사현황') {
				const tableEl = $(el).next();
				if (!tableEl) {
					throw new Error('table not found.');
				}
				const cellEls = tableEl.find('tbody tr td');

				const values = cellEls
					.toArray()
					.map((node) => this._normalize($(node).text()));

				result = {
					confirmed: values[3],
					released: values[1],
					death: values[2],
					tested: values[5],
					testing: values[6],
					negative: values[4],
				};
			}
		})

		if (result == null) {
			throw new Error('Data not found');
		}

		return result;
	}

	_extractByAge() { };
	_extractBySex() { };

	_normalize(numberText) {
		const matches = /[0-9,]+/.exec(numberText);
		const absValue = matches[0];
		return parseInt(absValue.replace(/[\s,]*/g, ''));
	}

}

module.exports = DomesticCrawler;
