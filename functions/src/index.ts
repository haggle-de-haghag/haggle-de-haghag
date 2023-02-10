import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ForeignPlayer, FullGameInfo, FullPlayerInfo, Game, Player, PlayerIdWithAmount, Rule, Token } from "./model";

admin.initializeApp();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

type RuleDoc = Omit<Rule, 'id'>;
type TokenDoc = Omit<Token, 'id'>;
type PlayerDoc = Omit<Player, 'id'>;
type FullGameInfoDoc = Omit<FullGameInfo, 'players' | 'rules' | 'tokens'> & {
    players: string[],
    rules: string[],
    tokens: string[],
};

type IdModel = { id: string };

const db = admin.firestore();
const games = db.collection('games') as admin.firestore.CollectionReference<FullGameInfoDoc>;
const rules = db.collection('rules') as admin.firestore.CollectionReference<RuleDoc>;
const tokens = db.collection('tokens') as admin.firestore.CollectionReference<TokenDoc>;
const players = db.collection('players') as admin.firestore.CollectionReference<PlayerDoc>;

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

function docIntoIdModel<T>(doc: admin.firestore.DocumentSnapshot<T>): T & IdModel {
    const data = doc.data();
    if (data == undefined) {
        throw new Error(`doc ${doc.id} does not exist`);
    }

    return {
        ...data,
        id: doc.id,
    };
}

async function refIntoIdModel<T>(ref: admin.firestore.DocumentReference<T>): Promise<T & IdModel> {
    return docIntoIdModel(await ref.get());
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

function intoToken(doc: admin.firestore.DocumentSnapshot<TokenDoc>): Token {
    const data = doc.data();
    if (data == undefined) {
        throw new Error(`doc ${doc.id} does not exist`);
    }

    return {
        ...data,
        id: doc.id,
    };
}

async function refIntoToken(docRef: admin.firestore.DocumentReference<TokenDoc>): Promise<Token> {
    return intoToken(await docRef.get());
}

function parsePartialToken(data: Record<string, any>): Partial<Token> {
    return {
        id: data['id'],
        title: data['title'],
        text: data['text'],
    };
}

function parsePartialPlayer(data: Record<string, any>): Partial<Player> {
    return {
        id: data['id'],
        displayName: data['displayName'],
    };
}

async function getAll<T extends admin.firestore.DocumentData>(refs: admin.firestore.DocumentReference<T>[]): Promise<admin.firestore.DocumentSnapshot<T>[]> {
    if (refs.length == 0) {
        return [];
    }

    return (await db.getAll(...refs)) as admin.firestore.DocumentSnapshot<T>[];
}

async function intoFullGameInfo(doc: FullGameInfoDoc): Promise<FullGameInfo> {
    const ruleDocs = doc.rules.map((ruleId) => rules.doc(ruleId));
    const ruleDocSnapshots = await getAll(ruleDocs);

    const tokenDocs = doc.tokens.map((tokenId) => tokens.doc(tokenId));
    const tokenDocSnapshots = await getAll(tokenDocs);

    const playerDocs = doc.players.map((id) => players.doc(id));
    const playerDocSnapshots = await getAll(playerDocs);

    return {
        ...doc,
        players: playerDocSnapshots.map(docIntoIdModel),
        rules: ruleDocSnapshots.map(intoRule).sort((a, b) => a.ruleNumber - b.ruleNumber),
        tokens: tokenDocSnapshots.map(intoToken),
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

async function findPlayerByKey(playerKey: string): Promise<Player | null> {
    const querySnapshot = await players.where('playerKey', '==', playerKey).get();
    if (querySnapshot.size == 0) {
        return null;
    }
    return docIntoIdModel(querySnapshot.docs[0]);
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

export const createToken = functions.https.onCall(async (data, context): Promise<Token> => {
    const fullGameInfo = await findFullGameInfo(data);
    const partialToken = parsePartialToken(data);

    const doc = tokens.doc();
    const tokenDoc: TokenDoc = {
        title: partialToken.title || '',
        text: partialToken.text || '',
        amount: 0,
    };

    await doc.create(tokenDoc);
    await fullGameInfo.ref.update({ "tokens": admin.firestore.FieldValue.arrayUnion(doc.id) });

    return refIntoToken(doc);
});

interface UpdateTokenResponse {
    token: Token;
    playerTokens: PlayerIdWithAmount[];
}

export const updateToken = functions.https.onCall(async (data, context): Promise<UpdateTokenResponse> => {
    const fullGameInfo = await findFullGameInfo(data);
    const partialToken = parsePartialToken(data['token']);
    const partialTokenId = partialToken.id;
    if (partialTokenId == undefined) {
        throw new Error(`token.id is required`);
    }

    const tokenDoc = await tokens.doc(partialTokenId).get();
    if (!tokenDoc.exists) {
        throw new Error(`Token ${partialToken.id} not found`);
    }

    await tokenDoc.ref.update(stripUndefined({
        title: partialToken.title,
        text: partialToken.text,
    }));

    const allocation = data['allocation'] as (Record<string, number> | undefined);
    if (allocation != undefined) {
        const allocationList: PlayerIdWithAmount[] = Object.entries(allocation).map(([key, val]) => ({ playerId: key, amount: val }));
        await fullGameInfo.ref.update({ [`tokenAllocationMap.${tokenDoc.id}`]: allocationList });
    }

    return {
        token: await refIntoToken(tokenDoc.ref),
        playerTokens: (await fullGameInfo.ref.get()).data()!!.tokenAllocationMap[tokenDoc.id]
    };
});

export const deleteToken = functions.https.onCall(async (data, context): Promise<void> => {
    const fullGameInfo = await findFullGameInfo(data);
    const partialToken = parsePartialToken(data['token']);
    const partialTokenId = partialToken.id;
    if (partialTokenId == undefined) {
        throw new Error(`token.id is required`);
    }

    const tokenDoc = await tokens.doc(partialTokenId).get();
    if (!tokenDoc.exists) {
        throw new Error(`Rule ${partialToken.id} not found`);
    }

    await fullGameInfo.ref.update({
        tokens: admin.firestore.FieldValue.arrayRemove(partialTokenId),
        [`tokenAllocationMap.${partialTokenId}`]: admin.firestore.FieldValue.delete(),
    });
    await tokenDoc.ref.delete();
});

export const addTokenToPlayer = functions.https.onCall(async (data, context): Promise<number> => {
    const fullGameInfo = await findFullGameInfo(data);
    const tokenId = data['tokenId'];
    const playerId = data['playerId'];
    const amount = parseInt(data['amount']);

    const allocation = fullGameInfo.data().tokenAllocationMap[tokenId];
    if (allocation == undefined) {
        throw new Error(`Invalid token id: ${tokenId}`);
    }

    let entry = allocation.find((e) => e.playerId == playerId);
    if (entry == undefined) {
        entry = { playerId, amount: 0 };
        allocation.push(entry);
    }

    entry.amount += amount;
    await fullGameInfo.ref.update({
        [`tokenAllocationMap.${tokenId}`]: allocation
    });
    return entry.amount;
});

export const createStubPlayers = functions.https.onCall(async (data, context): Promise<Player[]> => {
    const fullGameInfo = await findFullGameInfo(data);
    const numPlayers = fullGameInfo.data().players.length;
    const amount = parseInt(data['amount']);

    const newPlayersRef: admin.firestore.DocumentReference<PlayerDoc>[] = [];
    const batch = db.batch();
    for (let i = 0; i < amount; ++i) {
        const id = generateId();
        const doc = players.doc(id);
        batch.create(doc, {
            playerKey: id,
            displayName: `プレイヤー${numPlayers + i + 1}`,
            state: 'STUB',
            gameId: fullGameInfo.id,
        });
        newPlayersRef.push(doc);
    }
    await batch.commit();

    const playerIds = newPlayersRef.map((ref) => ref.id);
    await fullGameInfo.ref.update({
        players: admin.firestore.FieldValue.arrayUnion(...playerIds)
    });

    return Promise.all(newPlayersRef.map(refIntoIdModel));
});

export const kickPlayer = functions.https.onCall(async (data, context): Promise<Player> => {
    const fullGameInfo = await findFullGameInfo(data);
    const partialPlayer = parsePartialPlayer(data['player']);
    const playerId = partialPlayer.id;
    if (playerId == undefined) {
        throw new Error(`player.id is required`);
    }

    await fullGameInfo.ref.update({
        players: admin.firestore.FieldValue.arrayRemove(playerId)
    });

    const doc = players.doc(playerId);
    const player = await refIntoIdModel(doc);
    await doc.delete();
    return player;
});

export const fullPlayerInfo = functions.https.onCall(async (data, context): Promise<FullPlayerInfo> => {
    const player = await findPlayerByKey(data['playerKey']);
    if (player == null) {
        throw new Error(`Player ${data['playerKey']} not found`);
    }

    const fullGameInfoDocRef = games.doc(player.gameId);
    const fullGameInfo = await refIntoFullGameInfo(fullGameInfoDocRef);

    const foreignPlayers: ForeignPlayer[] = fullGameInfo.players.map((pl) => ({
        id: pl.id,
        displayName: pl.displayName
    })).filter((pl) => pl.id != player.id);

    const rules = fullGameInfo.rules.map((rule) => {
        const accessList = fullGameInfo.ruleAccessMap[rule.id];
        const access = accessList.find((a) => a.playerId == player.id);
        if (access != undefined) {
            return { ...rule, accessType: access.accessType };
        } else {
            return null;
        }
    }).filter((rule) => rule != null) as Rule[];

    const tokens = fullGameInfo.tokens.map((token) => {
        const allocationList = fullGameInfo.tokenAllocationMap[token.id];
        const allocation = allocationList.find((a) => a.playerId == player.id);
        if (allocation != undefined) {
            return { ...token, amount: allocation.amount };
        } else {
            return null;
        }
    }).filter((token) => token != null) as Token[];
    
    return {
        gameTitle: fullGameInfo.game.title,
        player,
        players: foreignPlayers,
        rules: rules.sort((a, b) => a.ruleNumber - b.ruleNumber),
        tokens: tokens.sort((a, b) => a.id.localeCompare(b.id)),
    };
});