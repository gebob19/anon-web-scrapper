var config = require('./config');

var torClient = require('./tor_client');

var scraperServices = require('./services/scrapeServices');
var wikiScraper = require('./services/scrapeServices/wikiScrape');
var fetchServices = require('./services/fetchServices');
var firebaseServices = require('./services/firebaseServices');


const watchURL = config.BASE_URL + config.WATCH_PATH;
var seriesTitle = '';
var series = '';
var wikiLink = 'https://en.wikipedia.org/wiki/List_of_Tokyo_Ghoul_episodes';

main();

async function main() {
    var data = await scraperServices.scrapeSeriesForEpisodeLinks(watchURL + series);

    var ts = data.get('ts');
    var server = data.get('rapidfire');

    var tor = new torClient();
    tor.debuger();
    await tor.start();
    
    // episodeLinks[i] is the link to the i-th episode
    var episodeLinks = [];
    for (var i=0; i < server.episodes.length; i++) {

        if (tor.numberOfRequests > 600) { // reset tor b/c of rate-limiting
            tor.terminate();
            tor = new torClient();
            tor.debuger();
            await tor.start();
        }

        var episode = server.episodes[i];
        var link = await fetchServices.fetchLink(episode.dataID, server.id, ts, tor);
        console.log(link);
        episodeLinks.push(link);
    }

    var mp4Links = await Promise.all(
        episodeLinks.map((link) => {
            var mp4Link = scraperServices.scrapeMP4(link);
            return mp4Link;
        })
    );
    console.log(mp4Links);

    var names = await wikiScraper.scrapeEpisodeNames(wikiLink, mp4Links.length);

    var docID = await firebaseServices.setNewSeries(seriesTitle);
    await firebaseServices.setSeriesLinks(docID, mp4Links, names);
    console.log('scrapping complete.');
}