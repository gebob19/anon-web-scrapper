var conf = require('./config.js');
var scraperServices = require('./services/scrapeServices');
var fetchServices = require('./services/fetchServices');
var torClient = require('./tor_client');

const watchURL = conf.BASE_URL + conf.WATCH_PATH;
var series = '';
main();

async function main() {
    var data = await scraperServices.scrapeSeriesForEpisodeLinks(watchURL + series);

    var ts = data.get('ts');
    var server = data.get('rapidfire');

    var tor = new torClient();
    tor.startDebuger();
    await tor.startTor();

    var episodeToVideoLink = new Map();
    for (var i=0; i < 10; i++) {

        if (i % 4 == 0 && i > 0) { // reset tor
            tor.terminate();
            tor = new torClient();
            tor.startDebuger();
            await tor.startTor();
        }

        var episode = server.episodes[i];
        var link = await fetchServices.fetchLink(episode.dataID, server.id, ts);
        console.log(link);
        episodeToVideoLink.set(episode.episodeNumber, link);
    }
    console.log(episodeToVideoLink);
}


