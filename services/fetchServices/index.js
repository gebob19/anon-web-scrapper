const config = require('../../config');
const util = require('util');
var tr = require('tor-request');
var torClient = require('../../torClient');

const knownMysteries = [1427, 1474, 1430];

//startProcess();
async function startProcess() {
    var tor = new torClient();
    tor.startDebuger();
    await tor.startTor();
    
    var link = await fetchLink(
        '7ylo3j',
        33,
        1524927600
    );
    console.log(link);
    tor.terminate();
}

async function fetchLink(episodeID, serverID, ts) {
    return new Promise(async (resolve, reject) => {
        var mystery = 1427;
        var link = await attemptKnownMysteries(ts, episodeID, serverID);
        resolve(link);
    }).catch(err => {
        console.log(err);
    });
}

async function attemptKnownMysteries(ts, episodeID, serverID) {
    return await Promise.all(knownMysteries.map(async mystery => {
        var requestLink = getRequestLink(ts, episodeID, serverID, mystery);
        var link = await apiRequest(requestLink);
        return link;
    })).catch(err => {
        console.log(err);
    })
}

function apiRequest(url) {
    return new Promise((resolve, reject) => {
        tr.request(url, function(err, resp, html) {
            if (!err && resp.statusCode == 200) {
                var JSONresp = JSON.parse(html)
                if (JSONresp.hasOwnProperty('error')) {
                    resolve('err');
                } else {
                    resolve(JSONresp.target);
                }
            }
        });
    });
}

function getRequestLink(ts, episodeID, serverID, mystery) {
    var tsParam = 'ts='+ts;
    var episodeIDParam = 'id='+episodeID;
    var serverIDParam = 'server='+serverID;
    var mysteryParam = '_='+mystery;
    var params = [tsParam, mysteryParam, episodeIDParam, serverIDParam].join('&');
    return config.BASE_URL + config.GET_VIDEO_INFO_PATH + params;
}

module.exports = {
    fetchLink,
};