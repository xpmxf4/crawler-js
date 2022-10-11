const _ = require("lodash");
const axios = require("axios");
const cheerio = require("cheerio");

class DomesticCrawler {
    constructor() {
        this.client = axios.create({
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
            }
        })
    }

    async crawlStat() {
        const url = "https://www.onemoretrip.net/ko/goods_category/sports-ko/";
        const resp = await this.client.get(url);
        const $ = cheerio.load(resp.data);

        return {
            basicStats: this._extractBasicStats($),
        }
    }

    _extractBasicStats() { }

    _normalize(numberText) {
        const matches = /[0-9,]+/.exec(numberText);
        const absValue = matches[0];
        return parseInt(absValue.replace(/[\s,]*/g, ''));
    }
}

module.exports = DomesticCrawler;