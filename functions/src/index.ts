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

type RuleDoc = Omit<Rule, 'id'>;
type FullGameInfoDoc = Omit<FullGameInfo, 'rules'> & {
    rules: string[]
};

const db = admin.firestore();
const games = db.collection('games') as admin.firestore.CollectionReference<FullGameInfoDoc>;
const rules = db.collection('rules') as admin.firestore.CollectionReference<RuleDoc>;

function generateId(): string {
    const letters = "0123456789abcdefghijklmnopqrstuvwxyz";
    let id = "";
    for(let i = 0; i < 10; ++i) {
        id += letters[Math.floor(Math.random() * letters.length)];
    }
    return id;
}

function stripUndefined<T extends Record<string, any>>(data: T): Partial<T> {
    const copy = { ...data };
    for (let key of Object.keys(copy)) {
        if (copy[key] == undefined) {
            delete copy[key];
        }
    }

    return copy;
}

function parsePartialRule(data: Record<string, any>): Partial<Rule> {
    return {
        id: data['id'],
        ruleNumber: parseInt(data['ruleNumber']),
        title: data['title'],
        text: data['text'],
        accessType: 'ASSIGNED'
    };
}

function intoRule(doc: admin.firestore.DocumentSnapshot<RuleDoc>): Rule {
    const data = doc.data();
    if (data == undefined) {
        throw new Error(`doc ${doc.id} does not exist`);
    }

    return {
        ...data,
        id: doc.id
    };
}

async function refIntoRule(docRef: admin.firestore.DocumentReference<RuleDoc>): Promise<Rule> {
    return intoRule(await docRef.get());
}

async function intoFullGameInfo(doc: FullGameInfoDoc): Promise<FullGameInfo> {
    const ruleDocs = doc.rules.map((ruleId) => rules.doc(ruleId));
    const ruleDocSnapshots = (await db.getAll(...ruleDocs)) as admin.firestore.DocumentSnapshot<RuleDoc>[];

    return {
        ...doc,
        rules: ruleDocSnapshots.map(intoRule).sort((a, b) => a.ruleNumber - b.ruleNumber),
    }
}

async function refIntoFullGameInfo(docRef: admin.firestore.DocumentReference<FullGameInfoDoc>): Promise<FullGameInfo> {
    const fullGameInfoDoc = await docRef.get();
    return intoFullGameInfo(fullGameInfoDoc.data()!!);
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
    const fullGameInfo: FullGameInfoDoc = {
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

async function findGameByMasterKey(masterKey: string): Promise<admin.firestore.QueryDocumentSnapshot<FullGameInfoDoc> | null> {
    const querySnapshot = await games.where('game.masterKey', '==', masterKey).get();
    if (querySnapshot.size == 0) {
        return null;
    }
    return querySnapshot.docs[0];
}

async function findFullGameInfo(data: any): Promise<admin.firestore.QueryDocumentSnapshot<FullGameInfoDoc>> {
    const masterKey: string = data['masterKey'];
    const snapshot = await findGameByMasterKey(masterKey);
    if (snapshot == null) {
        throw new Error(`Invalid master key: ${masterKey}`);
    }
    return snapshot;
}

async function findRuleDoc(ruleId: any): Promise<admin.firestore.DocumentSnapshot<RuleDoc>> {
    return rules.doc(ruleId).get();
}

export const fullGameInfo = functions.https.onCall(async (data, context): Promise<FullGameInfo> => {
    const fullGameInfoDocSnapshot = await findFullGameInfo(data);
    return intoFullGameInfo(fullGameInfoDocSnapshot.data());
});

export const updateTitle = functions.https.onCall(async (data, context): Promise<FullGameInfo> => {
    const fullGameInfoDocSnapshot = await findFullGameInfo(data);
    await fullGameInfoDocSnapshot.ref.update({ "game.title": data['title'] });
    return refIntoFullGameInfo(fullGameInfoDocSnapshot.ref);
});

export const setGameState = functions.https.onCall(async (data, context): Promise<FullGameInfo> => {
    const fullGameInfo = await findFullGameInfo(data);
    await fullGameInfo.ref.update({ "game.state": data['state'] });
    return refIntoFullGameInfo(fullGameInfo.ref);
});

export const createRule = functions.https.onCall(async (data, context): Promise<Rule> => {
    const fullGameInfo = await findFullGameInfo(data);
    const partialRule = parsePartialRule(data);
    const newRuleNumber = fullGameInfo.data().rules.length + 1;

    const doc = rules.doc();
    const rule: RuleDoc = {
        ruleNumber: newRuleNumber,
        title: partialRule.title || '',
        text: partialRule.text || '',
        accessType: 'ASSIGNED',
    };

    await doc.create(rule);
    await fullGameInfo.ref.update({ "rules": admin.firestore.FieldValue.arrayUnion(doc.id) });

    return {id: doc.id, ...rule} as Rule;
});

export const updateRule = functions.https.onCall(async (data, context): Promise<Rule> => {
    const fullGameInfo = await findFullGameInfo(data);
    const partialRule = parsePartialRule(data['rule']);
    const partialRuleId = partialRule.id;
    if (partialRuleId == undefined) {
        throw new Error(`rule.id is required`);
    }

    const ruleDoc = await findRuleDoc(partialRuleId);
    if (!ruleDoc.exists) {
        throw new Error(`Rule ${partialRule.id} not found`);
    }

    await ruleDoc.ref.update(stripUndefined({
        title: partialRule.title,
        text: partialRule.text,
    }));

    const assignedPlayerIds = data['assignedPlayerIds'] as (string[] | undefined);
    if (assignedPlayerIds != undefined) {
        const assignments = assignedPlayerIds.map((id) => ({ playerId: id, accessType: 'ASSIGNED' }));
        await fullGameInfo.ref.update({ [`ruleAccessMap.${ruleDoc.id}`]: assignments });
    }

    return refIntoRule(ruleDoc.ref);
});

export const deleteRule = functions.https.onCall(async (data, context): Promise<void> => {
    const fullGameInfo = await findFullGameInfo(data);
    const partialRule = parsePartialRule(data['rule']);
    const partialRuleId = partialRule.id;
    if (partialRuleId == undefined) {
        throw new Error(`rule.id is required`);
    }

    const ruleDoc = await findRuleDoc(partialRuleId);
    if (!ruleDoc.exists) {
        throw new Error(`Rule ${partialRule.id} not found`);
    }

    await fullGameInfo.ref.update({
        rules: admin.firestore.FieldValue.arrayRemove(partialRuleId),
        [`ruleAccessMap.${partialRuleId}`]: admin.firestore.FieldValue.delete(),
    });
    await ruleDoc.ref.delete();
});

export const moveRule = functions.https.onCall(async (data, context): Promise<Rule[]> => {
    const fullGameInfo = await findFullGameInfo(data);
    const ruleId = data['ruleId'];
    const toNumber = data['to'];

    const ruleDocsRef = fullGameInfo.data().rules.map((id) => rules.doc(id));
    const ruleDocSnapshots = await db.getAll(...ruleDocsRef) as admin.firestore.DocumentSnapshot<RuleDoc>[];
    const ruleItems = ruleDocSnapshots.map((ruleDocSnapshot) => intoRule(ruleDocSnapshot));
    ruleItems.sort((a, b) => a.ruleNumber - b.ruleNumber);

    const fromIdx = ruleItems.findIndex((rule) => rule.id == ruleId);
    if (fromIdx == -1) {
        throw new Error(`Rule ${ruleId} not found`);
    }

    let index = fromIdx;
    if (ruleItems[fromIdx].ruleNumber > toNumber) {
        while (index > 0 && ruleItems[index - 1].ruleNumber >= toNumber) {
            const tmp = ruleItems[index];
            ruleItems[index] = ruleItems[index - 1];
            ruleItems[index - 1] = tmp;
            index--;
        }
    } else {
        while (index < ruleItems.length - 1 && ruleItems[index + 1].ruleNumber <= toNumber) {
            const tmp = ruleItems[index];
            ruleItems[index] = ruleItems[index + 1];
            ruleItems[index + 1] = tmp;
            index++;
        }
    }

    const writeBatch = db.batch();
    ruleItems.forEach((rule, i) => {
        const docRef = rules.doc(rule.id);
        writeBatch.update(docRef, { ruleNumber: i+1 });
    })
    await writeBatch.commit();

    return (await refIntoFullGameInfo(fullGameInfo.ref)).rules;
});