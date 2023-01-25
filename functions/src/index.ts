import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FullGameInfo, Game, Rule } from "./model";

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

function parseRule(data: Record<string, any>): Rule {
    return {
        id: data['id'] || '',
        ruleNumber: data['ruleNumber'] || 0,
        title: data['title'] || '',
        text: data['text'] || '',
        accessType: 'ASSIGNED'
    };
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
    await fullGameInfo.ref.update({ "game.title": data['title'] });
    return fullGameInfo.data().game;
});

export const setGameState = functions.https.onCall(async (data, context) => {
    const fullGameInfo = await findFullGameInfo(data);
    await fullGameInfo.ref.update({ "game.state": data['state'] });
    return fullGameInfo.data().game;
});

export const createRule = functions.https.onCall(async (data, context) => {
    const fullGameInfo = await findFullGameInfo(data);
    const rule = parseRule(data);
    const newRuleNumber = fullGameInfo.data().rules.length + 1;
    rule.id = `${newRuleNumber}`;
    rule.ruleNumber = newRuleNumber;
    await fullGameInfo.ref.update({ "rules": admin.firestore.FieldValue.arrayUnion(rule) });
    return rule;
});