import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

export class Firebase {
    private _app: FirebaseApp;
    private _db: Firestore;

    constructor(config: FirebaseOptions) {
        this._app = initializeApp(config);
        this._db = getFirestore(this._app);
    }

    get db(): Firestore {
        return this._db;
    }
}