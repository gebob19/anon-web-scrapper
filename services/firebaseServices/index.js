const config = require('../../config/firebase');
var admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(config.serviceAccount),
    databaseURL: config.databaseURL,
});

const db = admin.app().firestore();

function setNewSeries(title) {
    return new Promise((resolve, reject) => {
        db.collection('series').add({
            coverArt: '',
            title: title,
        }).then(ref => {
            db.collection('seriesLinks').doc(ref.id).set({
                links: [],
                names: [],
            }).then(() => {
                resolve(ref.id);
            });
        });
    });
}

function getKnownMysteries() {
    return new Promise((resolve, reject) => {
        db.collection('mysteries').doc('known').get()
            .then(doc => {
                var known = doc.data().mysteries;
                resolve(known);
            })
    })
}

async function addNewMystery(mystery) {
    var knownMysteries = await getKnownMysteries();
    if (knownMysteries.indexOf(mystery) == -1) {
        knownMysteries.push(mystery);
        db.collection('mysteries').doc('known').set({
            mysteries: knownMysteries,
        });
    }
}

function setSeriesLinks(id, links, names) {
    return new Promise((resolve, reject) => {
        db.collection('seriesLinks').doc(id).update({
            links: links,
            names: names,
        });
    });
}

module.exports = {
    setNewSeries,
    setSeriesLinks,
    getKnownMysteries,
    addNewMystery
};