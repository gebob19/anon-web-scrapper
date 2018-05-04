const cheerio = require('cheerio');
const request = require('request');

function scrapeEpisodeNames(link, amount) {
    return new Promise((resolve, reject) => {
        const names = [];
        request(link, (err, resp, html) => {
            if (!err && resp.statusCode == 200) {
                var $ = cheerio.load(html);
                $('td.summary').each((i, elem) => {
                    var name = elem.children[0].data;
                    var withoutQuotes = name.slice(1, -1);
                    names.push(withoutQuotes);
                }); 
                var sliced = names.slice(0, amount);
                resolve(sliced);
            }
        });
    });
}

module.exports = {
    scrapeEpisodeNames   
}
