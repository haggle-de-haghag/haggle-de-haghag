import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FullGameInfo, Game } from "./model";

admin.initializeApp();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const db = admin.firestore();
const games = db.collection('games') as admin.firestore.CollectionReference<FullGameInfo>;

function generateId(): string {
    const letters = "0123456789abcdefghijklmnopqrstuvwxyz";
    let id = "";
    for(let i = 0; i < 10; ++i) {
        id += letters[Math.floor(Math.random() * letters.length)];
    }
    return id;
}

export const createGame = functions.https.onCall(async (data, context) => {
    const id = generateId();
    const masterKey = generateId();

    const doc = games.doc(id);
    const game: Game = {
        id,
        title: data['title'],
        gameKey: id,
        masterKey: masterKey,
        state: 'PLAYING'
    };
    const fullGameInfo: FullGameInfo = {
        game,
        rules: [],
        players: [],
        ruleAccessMap: {},
        tokens: [],
        tokenAllocationMap: {}
    };

    try {
        await doc.create(fullGameInfo);
    } catch (e) {
        console.log(e);
        throw new Error(`Failed to create a unique ID`);
    }

    return game;
});

async function findGameByMasterKey(masterKey: string): Promise<admin.firestore.QueryDocumentSnapshot<FullGameInfo> | null> {
    const querySnapshot = await games.where('game.masterKey', '==', masterKey).get();
    if (querySnapshot.size == 0) {
        return null;
    }
    return querySnapshot.docs[0];
}

async function findFullGameInfo(data: any): Promise<admin.firestore.QueryDocumentSnapshot<FullGameInfo>> {
    const masterKey: string = data['masterKey'];
    const snapshot = await findGameByMasterKey(masterKey);
    if (snapshot == null) {
        throw new Error(`Invalid master key: ${masterKey}`);
    }
    return snapshot;
}

export const fullGameInfo = functions.https.onCall(async (data, context) => {
    return (await findFullGameInfo(data)).data();
});

export const updateTitle = functions.https.onCall(async (data, context) => {
    const fullGameInfo = await findFullGameInfo(data);
    fullGameInfo.ref.update({ "game.title": data['title'] });
    return fullGameInfo.data().game;
});