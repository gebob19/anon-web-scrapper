var conf = require('./config.js');
var scraperServices = require('./services/scraperServices');
var fetchServices = require('./services/fetchServices');

const watchURL = conf.BASE_URL + conf.WATCH_PATH;
var series = '';

main();

async function main() {
    var data = await scraperServices.scrapeSeriesForEpisodeLinks(watchURL + series);

    var ts = data.get('ts');
    var server = data.get('rapidfire');

    var testEpisodes = [
        server.episodes[20],
        server.episodes[21]];

    var episodeToVideoLink = new Map();

    for (const episode of testEpisodes) {
        //var link = await fetchServices.fetchLink(episode.dataID, server.id, ts);
    }
    console.log(episodeToVideoLink);
}
