const config = require('../../config');
const util = require('util');
var tr = require('tor-request');
var firebaseServices = require('../firebaseServices');

async function fetchLink(episodeID, serverID, ts, tor) {
    return new Promise(async (resolve, reject) => {
        //console.log(episodeID, serverID, ts);

        var knownMysteries = await firebaseServices.getKnownMysteries();
        // attempt with known mysteries
        var resp0 = await attemptGivenMysteries(
            ts, episodeID, serverID, knownMysteries
        );
        tor.incrementRequestCount(knownMysteries.length);
        var link = findLink(resp0);
        if (link) 
            return resolve(link);

        // attempt brute force
        //console.log('----1350 - 1399-----');
        var mysteryAttempt = await getMysteryAttempt(1350, 50);
        var resp1 = await attemptGivenMysteries(
            ts, episodeID, serverID, mysteryAttempt
        );
        var link = findLink(resp1);
        tor.incrementRequestCount(mysteryAttempt.length);
        if (link) 
            return resolve(link);

        //console.log('----1400 - 1449 -----');
        var mysteryAttempt = getMysteryAttempt(1400, 50);
        var resp2 = await attemptGivenMysteries(
            ts, episodeID, serverID, mysteryAttempt
        );
        var link = findLink(resp2);
        tor.incrementRequestCount(mysteryAttempt.length);
        if (link) 
            return resolve(link);

        //console.log('----1450 - 1499 -----');
        var mysteryAttempt = getMysteryAttempt(1450, 51);
        var resp2 = await attemptGivenMysteries(
            ts, episodeID, serverID, mysteryAttempt
        );
        var link = findLink(resp2);
        tor.incrementRequestCount(mysteryAttempt.length);
        if (link) 
            return resolve(link);

        resolve('no link found');
    });
}

async function attemptGivenMysteries(ts, episodeID, serverID, mysteries) {
    return await Promise.all(mysteries.map(async mystery => {
        var requestLink = getRequestLink(ts, episodeID, serverID, mystery);
        var link = await apiRequest(requestLink, mystery);
        return link;
    })).catch(err => {
        console.log(err);
    })
}

function getMysteryAttempt(startValue, size) {
    var mysteryAttempt = [];
    for (i=startValue; i < (startValue+size); i++) 
        mysteryAttempt.push(i);
    return mysteryAttempt;
}

function apiRequest(url, mystery) {
    return new Promise((resolve, reject) => {
        tr.request(url, function(err, resp, html) {
            if (!err && resp.statusCode == 200) {
                var JSONresp = JSON.parse(html);
                if (JSONresp.hasOwnProperty('target')) {
                    firebaseServices.addNewMystery(mystery);
                    resolve(JSONresp.target);
                } else {
                    resolve('err');
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

function findLink(list) {
    for (i=0; i < list.length; i++) {
        if (list[i] !== 'err') return list[i];
    }
    return false;
}

module.exports = {
    fetchLink,
};