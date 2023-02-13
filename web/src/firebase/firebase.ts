import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, Functions, getFunctions, HttpsCallable, httpsCallable } from 'firebase/functions';

declare global {
  var BUILD_ENV: 'local' | 'qa' | 'prod';
}

function getFirebaseConfig() {
  if (BUILD_ENV == 'local' || BUILD_ENV == 'qa') {
    return {
      apiKey: "AIzaSyDzAkWLAV5BZHaayUdZSeRTNjc5eiha20k",
      authDomain: "haggle-de-haghag-dev.firebaseapp.com",
      projectId: "haggle-de-haghag-dev",
      storageBucket: "haggle-de-haghag-dev.appspot.com",
      messagingSenderId: "995143060929",
      appId: "1:995143060929:web:a7c127a93736f42ffbb340",
      measurementId: "G-0PWQVVMHDT"
    };
  } else if (BUILD_ENV == 'prod') {

  }

  throw new Error(`Unsupported env ${BUILD_ENV}`);
}

export class Firebase {
    private _app: FirebaseApp;
    private _db: Firestore;
    private _functions: Functions;

    constructor() {
        this._app = initializeApp(getFirebaseConfig());
        this._db = getFirestore(this._app);
        this._functions = getFunctions(this._app);

        if (BUILD_ENV == 'local') {
            connectFunctionsEmulator(this._functions, 'localhost', 5001);
        }
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