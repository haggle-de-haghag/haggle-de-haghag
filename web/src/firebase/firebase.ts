import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, Functions, getFunctions, HttpsCallable, httpsCallable } from 'firebase/functions';

export class Firebase {
    private _app: FirebaseApp;
    private _db: Firestore;
    private _functions: Functions;

    constructor(config: FirebaseOptions) {
        this._app = initializeApp(config);
        this._db = getFirestore(this._app);
        this._functions = getFunctions(this._app);
        connectFunctionsEmulator(this._functions, 'localhost', 5001);
    }

    get db(): Firestore {
        return this._db;
    }

    get functions(): Functions {
        return this._functions;
    }

    getCallable<T, R>(name: string): HttpsCallable<T, R> {
        return httpsCallable(this.functions, name);
    }
}