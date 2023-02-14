import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {ForeignPlayer, FullGameInfo, FullPlayerInfo, Game, Player, PlayerIdWithAmount, PlayerState, Rule, Token, TokenAllocationMap} from "./model";

admin.initializeApp();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

type RuleDoc = Omit<Rule, "id">;
type TokenDoc = Omit<Token, "id">;
type PlayerDoc = Omit<Player, "id">;
type FullGameInfoDoc = Omit<FullGameInfo, "players" | "rules" | "tokens" | "tokenAllocationMap"> & {
    players: string[],
    rules: string[],
    tokens: string[],
};

type IdModel = { id: string };

const db = admin.firestore();
const games = db.collection("games") as admin.firestore.CollectionReference<FullGameInfoDoc>;
const rules = db.collection("rules") as admin.firestore.CollectionReference<RuleDoc>;
const tokens = db.collection("tokens") as admin.firestore.CollectionReference<TokenDoc>;
const players = db.collection("players") as admin.firestore.CollectionReference<PlayerDoc>;

function generateId(): string {
  const letters = "0123456789abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 10; ++i) {
    id += letters[Math.floor(Math.random() * letters.length)];
  }
  return id;
}

function stripUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  const copy = {...data};
  for (const key of Object.keys(copy)) {
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
    id: data["id"],
    ruleNumber: parseInt(data["ruleNumber"]),
    title: data["title"],
    text: data["text"],
    accessType: "ASSIGNED",
  };
}

function intoRule(doc: admin.firestore.DocumentSnapshot<RuleDoc>): Rule {
  const data = doc.data();
  if (data == undefined) {
    throw new Error(`doc ${doc.id} does not exist`);
  }

  return {
    ...data,
    id: doc.id,
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
    id: data["id"],
    title: data["title"],
    text: data["text"],
  };
}

function parsePartialPlayer(data: Record<string, any>): Partial<Player> {
  return {
    id: data["id"],
    displayName: data["displayName"],
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

  const playerItems = playerDocSnapshots.map(docIntoIdModel);
  const tokenItems = tokenDocSnapshots.map(intoToken);
  const tokenAllocationMap: TokenAllocationMap = {};
  for (const token of tokenItems) {
    tokenAllocationMap[token.id] = playerItems.map((pl) => ({playerId: pl.id, amount: pl.tokenAllocation[token.id]}));
  }
  return {
    ...doc,
    players: playerItems,
    rules: ruleDocSnapshots.map(intoRule).sort((a, b) => a.ruleNumber - b.ruleNumber),
    tokens: tokenItems,
    tokenAllocationMap,
  };
}

async function refIntoFullGameInfo(docRef: admin.firestore.DocumentReference<FullGameInfoDoc>): Promise<FullGameInfo> {
  const fullGameInfoDoc = await docRef.get();
  return intoFullGameInfo(fullGameInfoDoc.data()!);
}

interface CreatePlayerTag {
    state: PlayerState;
    displayName: string;
}

async function createPlayers(gameId: string, playerTags: CreatePlayerTag[]): Promise<Player[]> {
  const newPlayersRef: admin.firestore.DocumentReference<PlayerDoc>[] = [];
  const batch = db.batch();
  for (let tag of playerTags) {
    const id = generateId();
    const doc = players.doc(id);
    batch.create(doc, {
      playerKey: id,
      displayName: tag.displayName,
      state: tag.state,
      gameId: gameId,
      tokenAllocation: {},
    });
    newPlayersRef.push(doc);
  }
  await batch.commit();

  const playerIds = newPlayersRef.map((ref) => ref.id);
  await games.doc(gameId).update({
    players: admin.firestore.FieldValue.arrayUnion(...playerIds),
  });

  return Promise.all(newPlayersRef.map(refIntoIdModel));
}

export const createGame = functions.https.onCall(async (data, context) => {
  const id = generateId();
  const masterKey = generateId();

  const doc = games.doc(id);
  const game: Game = {
    id,
    title: data["title"],
    gameKey: id,
    masterKey: masterKey,
    state: "PLAYING",
  };
  const fullGameInfo: FullGameInfoDoc = {
    game,
    rules: [],
    players: [],
    ruleAccessMap: {},
    tokens: [],
  };

  try {
    await doc.create(fullGameInfo);
  } catch (e) {
    console.log(e);
    throw new Error("Failed to create a unique ID");
  }

  return game;
});

export const joinGame = functions.https.onCall(async (data, context) => {
    const gameId = data['gameId'];
    const playerName = data['playerName'];

    const fullGameInfo = await refIntoFullGameInfo(games.doc(gameId));
    let player: Player | undefined;

    for (let attempt = 0; player == undefined && attempt < 3; ++attempt) {
        const stubPlayers = fullGameInfo.players.filter((pl) => pl.state == 'STUB');
        for (let p of stubPlayers) {
            const playerRef = players.doc(p.id);
            const playerSnapshot = await playerRef.get();
            if (playerSnapshot.data()?.state == 'STUB') {
                try {
                    await playerRef.update({
                        state: 'ACTIVE',
                        displayName: playerName
                    }, { lastUpdateTime: playerSnapshot.updateTime });
                    player = await refIntoIdModel(playerRef);
                    break;
                } catch (e) {
                    console.log(`Failed to acquire ${p.id}. Trying next stub.`);
                }
            }
        }
    }

    if (player == undefined) {
        // Assume there's no stub remaining. Create a new player.
        const result = await createPlayers(gameId, [{ state: 'ACTIVE', displayName: playerName }]);
        player = result[0];
    }

    return player;
});

async function findGameByMasterKey(masterKey: string): Promise<admin.firestore.QueryDocumentSnapshot<FullGameInfoDoc> | null> {
  const querySnapshot = await games.where("game.masterKey", "==", masterKey).get();
  if (querySnapshot.size == 0) {
    return null;
  }
  return querySnapshot.docs[0];
}

async function findFullGameInfo(data: any): Promise<admin.firestore.QueryDocumentSnapshot<FullGameInfoDoc>> {
  const masterKey: string = data["masterKey"];
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
  const querySnapshot = await players.where("playerKey", "==", playerKey).get();
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
  await fullGameInfoDocSnapshot.ref.update({"game.title": data["title"]});
  return refIntoFullGameInfo(fullGameInfoDocSnapshot.ref);
});

export const setGameState = functions.https.onCall(async (data, context): Promise<FullGameInfo> => {
  const fullGameInfo = await findFullGameInfo(data);
  await fullGameInfo.ref.update({"game.state": data["state"]});
  return refIntoFullGameInfo(fullGameInfo.ref);
});

export const createRule = functions.https.onCall(async (data, context): Promise<Rule> => {
  const fullGameInfo = await findFullGameInfo(data);
  const partialRule = parsePartialRule(data);
  const newRuleNumber = fullGameInfo.data().rules.length + 1;

  const doc = rules.doc();
  const rule: RuleDoc = {
    ruleNumber: newRuleNumber,
    title: partialRule.title || "",
    text: partialRule.text || "",
    accessType: "ASSIGNED",
  };

  await doc.create(rule);
  await fullGameInfo.ref.update({"rules": admin.firestore.FieldValue.arrayUnion(doc.id)});

  return {id: doc.id, ...rule} as Rule;
});

export const updateRule = functions.https.onCall(async (data, context): Promise<Rule> => {
  const fullGameInfo = await findFullGameInfo(data);
  const partialRule = parsePartialRule(data["rule"]);
  const partialRuleId = partialRule.id;
  if (partialRuleId == undefined) {
    throw new Error("rule.id is required");
  }

  const ruleDoc = await findRuleDoc(partialRuleId);
  if (!ruleDoc.exists) {
    throw new Error(`Rule ${partialRule.id} not found`);
  }

  await ruleDoc.ref.update(stripUndefined({
    title: partialRule.title,
    text: partialRule.text,
  }));

  const assignedPlayerIds = data["assignedPlayerIds"] as (string[] | undefined);
  if (assignedPlayerIds != undefined) {
    const assignments = assignedPlayerIds.map((id) => ({playerId: id, accessType: "ASSIGNED"}));
    await fullGameInfo.ref.update({[`ruleAccessMap.${ruleDoc.id}`]: assignments});
  }

  return refIntoRule(ruleDoc.ref);
});

export const deleteRule = functions.https.onCall(async (data, context): Promise<void> => {
  const fullGameInfo = await findFullGameInfo(data);
  const partialRule = parsePartialRule(data["rule"]);
  const partialRuleId = partialRule.id;
  if (partialRuleId == undefined) {
    throw new Error("rule.id is required");
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
  const ruleId = data["ruleId"];
  const toNumber = data["to"];

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
    writeBatch.update(docRef, {ruleNumber: i+1});
  });
  await writeBatch.commit();

  return (await refIntoFullGameInfo(fullGameInfo.ref)).rules;
});

export const createToken = functions.https.onCall(async (data, context): Promise<Token> => {
  const fullGameInfo = await findFullGameInfo(data);
  const partialToken = parsePartialToken(data);

  const doc = tokens.doc();
  const tokenDoc: TokenDoc = {
    title: partialToken.title || "",
    text: partialToken.text || "",
    amount: 0,
  };

  await doc.create(tokenDoc);
  await fullGameInfo.ref.update({"tokens": admin.firestore.FieldValue.arrayUnion(doc.id)});

  return refIntoToken(doc);
});

interface UpdateTokenResponse {
    token: Token;
    playerTokens: PlayerIdWithAmount[];
}

export const updateToken = functions.https.onCall(async (data, context): Promise<UpdateTokenResponse> => {
  const fullGameInfo = await findFullGameInfo(data);
  const partialToken = parsePartialToken(data["token"]);
  const partialTokenId = partialToken.id;
  if (partialTokenId == undefined) {
    throw new Error("token.id is required");
  }

  const tokenDoc = await tokens.doc(partialTokenId).get();
  if (!tokenDoc.exists) {
    throw new Error(`Token ${partialToken.id} not found`);
  }

  await tokenDoc.ref.update(stripUndefined({
    title: partialToken.title,
    text: partialToken.text,
  }));

  const allocation = data["allocation"] as (Record<string, number> | undefined);
  if (allocation != undefined) {
    const writeBatch = db.batch();
    for (const [playerId, amount] of Object.entries(allocation)) {
      const playerDocRef = players.doc(playerId);
      writeBatch.update(playerDocRef, {
        [`tokenAllocation.${tokenDoc.id}`]: amount,
      });
    }
    await writeBatch.commit();
  }

  const playerDocs = await getAll(fullGameInfo.data().players.map((id) => players.doc(id)));
  const playerItems = playerDocs.map(docIntoIdModel);
  const playerTokens = playerItems.map((pl) => ({playerId: pl.id, amount: pl.tokenAllocation[tokenDoc.id]}));

  return {
    token: await refIntoToken(tokenDoc.ref),
    playerTokens,
  };
});

export const deleteToken = functions.https.onCall(async (data, context): Promise<void> => {
  const fullGameInfo = await findFullGameInfo(data);
  const partialToken = parsePartialToken(data["token"]);
  const partialTokenId = partialToken.id;
  if (partialTokenId == undefined) {
    throw new Error("token.id is required");
  }

  const tokenDoc = await tokens.doc(partialTokenId).get();
  if (!tokenDoc.exists) {
    throw new Error(`Rule ${partialToken.id} not found`);
  }

  await fullGameInfo.ref.update({
    tokens: admin.firestore.FieldValue.arrayRemove(partialTokenId),
  });
  await tokenDoc.ref.delete();
});

export const addTokenToPlayer = functions.https.onCall(async (data, context): Promise<number> => {
  const tokenId = data["tokenId"];
  const playerId = data["playerId"];
  const amount = parseInt(data["amount"]);

  const playerDoc = players.doc(playerId);
  await playerDoc.update({
    [`tokenAllocation.${tokenId}`]: admin.firestore.FieldValue.increment(amount),
  });
  return (await playerDoc.get()).data()!.tokenAllocation[tokenId];
});

export const createStubPlayers = functions.https.onCall(async (data, context): Promise<Player[]> => {
  const fullGameInfo = await findFullGameInfo(data);
  const numPlayers = fullGameInfo.data().players.length;
  const amount = parseInt(data["amount"]);

  const tags: CreatePlayerTag[] = Array(amount).fill(0).map((_, i) => ({ state: 'STUB', displayName: `プレイヤー${numPlayers + i + 1}` }));
  return createPlayers(fullGameInfo.id, tags);
});

export const kickPlayer = functions.https.onCall(async (data, context): Promise<Player> => {
  const fullGameInfo = await findFullGameInfo(data);
  const partialPlayer = parsePartialPlayer(data["player"]);
  const playerId = partialPlayer.id;
  if (playerId == undefined) {
    throw new Error("player.id is required");
  }

  await fullGameInfo.ref.update({
    players: admin.firestore.FieldValue.arrayRemove(playerId),
  });

  const doc = players.doc(playerId);
  const player = await refIntoIdModel(doc);
  await doc.delete();
  return player;
});

export const fullPlayerInfo = functions.https.onCall(async (data, context): Promise<FullPlayerInfo> => {
  const player = await findPlayerByKey(data["playerKey"]);
  if (player == null) {
    throw new Error(`Player ${data["playerKey"]} not found`);
  }

  const fullGameInfoDocRef = games.doc(player.gameId);
  const fullGameInfo = await refIntoFullGameInfo(fullGameInfoDocRef);

  const foreignPlayers: ForeignPlayer[] = fullGameInfo.players.map((pl) => ({
    id: pl.id,
    displayName: pl.displayName,
  })).filter((pl) => pl.id != player.id);

  const rules = fullGameInfo.rules.map((rule) => {
    const accessList = fullGameInfo.ruleAccessMap[rule.id];
    const access = accessList?.find((a) => a.playerId == player.id);
    if (access != undefined) {
      return {...rule, accessType: access.accessType};
    } else if (fullGameInfo.game.state == "POST_MORTEM") {
      return {...rule, accessType: "POST_MORTEM"};
    } else {
      return null;
    }
  }).filter((rule) => rule != null) as Rule[];

  const tokens = fullGameInfo.tokens.map((token) => {
    const amount = player.tokenAllocation[token.id] ?? 0;
    if (fullGameInfo.game.state == "POST_MORTEM" || amount > 0) {
      return {...token, amount};
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

export const updatePlayerName = functions.https.onCall(async (data, context): Promise<Player> => {
  const player = await findPlayerByKey(data["playerKey"]);
  if (player == null) {
    throw new Error(`Player ${data["playerKey"]} not found`);
  }

  const playerDocRef = players.doc(player.id);
  await playerDocRef.update({"displayName": data["name"]});
  return refIntoIdModel(playerDocRef);
});

export const shareRule = functions.https.onCall(async (data, context): Promise<boolean> => {
  const player = await findPlayerByKey(data["playerKey"]);
  if (player == null) {
    throw new Error(`Player ${data["playerKey"]} not found`);
  }
  const ruleId = data["ruleId"];
  const toPlayerId = data["toPlayerId"];

  const fullGameInfoDocRef = games.doc(player.gameId);
  const fullGameInfo = await refIntoFullGameInfo(fullGameInfoDocRef);

  const ruleAccessList = fullGameInfo.ruleAccessMap[ruleId];
  if (ruleAccessList == undefined) {
    throw new Error(`Rule ${ruleId} not found`);
  }

  const fromRuleAccess = ruleAccessList.find((a) => a.playerId == player.id);
  if (fromRuleAccess == undefined || fromRuleAccess.accessType != "ASSIGNED") {
    throw new Error(`Invalid access to rule ${ruleId}`);
  }

  const toRuleAccess = ruleAccessList.find((a) => a.playerId == toPlayerId);
  if (toRuleAccess != undefined) {
    console.log(`Player ${toPlayerId} already knows rule ${ruleId}`);
    return false;
  }

  await fullGameInfoDocRef.update({
    [`ruleAccessMap.${ruleId}`]: admin.firestore.FieldValue.arrayUnion({playerId: toPlayerId, accessType: "SHARED"}),
  });
  return true;
});

export const giveToken = functions.https.onCall(async (data, context): Promise<boolean> => {
  const player = await findPlayerByKey(data["playerKey"]);
  if (player == null) {
    throw new Error(`Player ${data["playerKey"]} not found`);
  }
  const tokenId = data["tokenId"];
  const toPlayerId = data["toPlayerId"];
  const amount = parseInt(data["amount"]);

  if (player.tokenAllocation[tokenId] < amount) {
    console.log(`Player ${player.id} does not have ${amount} of token ${tokenId}`);
    return false;
  }

  await players.doc(toPlayerId).update({
    [`tokenAllocation.${tokenId}`]: admin.firestore.FieldValue.increment(amount),
  });
  await players.doc(player.id).update({
    [`tokenAllocation.${tokenId}`]: admin.firestore.FieldValue.increment(-amount),
  });

  return true;
});