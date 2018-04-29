var cheerio = require('cheerio');
var request = require('request');
var fetchServ = require('../fetchServices');

var serverIds = {
    33 : "rapidfire",
    28 : "myCloud",
    34 : "StreamMango",
    24 : "Openload"
};

function scrapeSeriesForEpisodeLinks(link) {
    return new Promise((resolve, reject) => {
        request(link, function(err, resp, html) {
            if (!err && resp.statusCode == 200) {
                var $ = cheerio.load(html);
                // server -> all episodes on server
                var availableServerIDs = new Map(); 
                var ts = $('html').get(0).attribs["data-ts"];
                var serverElements = $('div.widget-body').find($('div.server')); 
                
                serverElements.each(function(i, elem) {
                    scrapeServerInformation(elem, availableServerIDs, ts);
                })
                availableServerIDs.set('ts', ts);
                resolve(availableServerIDs);
            }
        })
    });
}

function validEpisodeBlock(block) {
    return (
        block.type === 'tag' 
        && block.attribs['class'] !== 'range'
    );
}

async function scrapeServerInformation(elem, availableServerIDs, ts) {
    var serverId = parseInt(elem.attribs['data-id']);
    var serverName = serverIds[serverId];
    var serverInfo = {
        "id" : serverId,
        "episodes" : [],
    }

    var episodeBlocks = elem.childNodes; 
    for (i=0; i < episodeBlocks.length; i++) {    
        if (validEpisodeBlock(episodeBlocks[i])) {
            var allEpisodesOfBlock = episodeBlocks[i].childNodes;
            // parse each episode inside the current block
            for (j = 1; j < allEpisodesOfBlock.length; j+=2) {  
                var episodeLi = allEpisodesOfBlock[j]; 
                // access episodes information tag
                var episodeInfo = episodeLi.children[1].attribs; 
                var filteredInfo = filter(episodeInfo);
                serverInfo.episodes.push(filteredInfo);
            }
        }
    }
    availableServerIDs.set(serverName, serverInfo);
}

/*
Filters unwated information on an episode
ex.
Input:
{   
    'data-id': '',
    'data-base': '25',
    'data-comment': '25',
    'data-toggle': 'tooltip',
    'data-title': 'Dec 28, 2016 - 05:09',
    href: '/watch/tvshow/tv_id' 
}

Output:
{   
    'data-id': '',
    'data-title': 'Dec 28, 2016 - 05:09',
    href: '/watch/tvshow/tv_id' ,
} */
function filter(episodeInfo) {
    return {
        'dataID' : episodeInfo['data-id'],
        'dataDate' : episodeInfo['data-title'],
        'episodeNumber' : episodeInfo['data-base'],
        href : episodeInfo.href,
    };
}

module.exports = {
    scrapeSeriesForEpisodeLinks,
};