import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Game } from "./model";

admin.initializeApp();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const db = admin.firestore();
const games = db.collection('games') as admin.firestore.CollectionReference<Game>;

function generateId(): string {
    const letters = "0123456789abcdefghijklmnopqrstuvwxyz";
    let id = "";
    for(let i = 0; i < 10; ++i) {
        id += letters[Math.floor(Math.random() * letters.length)];
    }
    return id;
}

export const createGame = functions.https.onRequest(async (request, response) => {
    const id = generateId();
    const masterKey = generateId();

    const doc = games.doc(id);
    try {
        await doc.create({
            id,
            title: request.body['title'],
            gameKey: id,
            masterKey: masterKey,
            state: 'PLAYING'
        });
    } catch (e) {
        console.log(e);
        throw new Error(`Failed to create a unique ID`);
    }

    const game = await doc.get();
    response.json(game.data);
});